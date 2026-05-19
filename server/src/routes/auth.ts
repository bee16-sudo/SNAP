import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import db from '../db/db';
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiresAt,
} from '../utils/jwt';
import { requireAuth } from '../middleware/auth';

const router = Router();

// ─── VALIDATION SCHEMAS ───────────────────────────────────────────
const RegisterSchema = z.object({
  email:        z.string().email('Invalid email address'),
  password:     z.string().min(8, 'Password must be at least 8 characters'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters').max(60),
  phone:        z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Invalid phone number').optional(),
});

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const RefreshSchema = z.object({
  refresh_token: z.string().min(1),
});

// ─── HELPERS ──────────────────────────────────────────────────────
const BCRYPT_ROUNDS = 12;

function buildUserResponse(user: {
  id: string; email: string; display_name: string;
  phone: string | null; avatar_url: string | null;
  is_verified: number; created_at: string; last_login_at: string | null;
}) {
  return {
    id:            user.id,
    email:         user.email,
    display_name:  user.display_name,
    phone:         user.phone ?? undefined,
    avatar_url:    user.avatar_url ?? undefined,
    is_verified:   user.is_verified === 1,
    created_at:    user.created_at,
    last_login_at: user.last_login_at ?? undefined,
  };
}

function issueTokens(userId: string, email: string) {
  const accessToken            = signAccessToken({ userId, email });
  const { raw, hash }          = generateRefreshToken();
  const expiresAt              = refreshTokenExpiresAt();

  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), userId, hash, expiresAt.toISOString());

  return { accessToken, refreshToken: raw };
}

// ─── POST /auth/register ──────────────────────────────────────────
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { email, password, display_name, phone } = parsed.data;

  // Check email uniqueness
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const userId        = uuidv4();

  db.prepare(`
    INSERT INTO users (id, email, password_hash, display_name, phone)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, email.toLowerCase().trim(), password_hash, display_name.trim(), phone ?? null);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as {
    id: string; email: string; display_name: string; phone: string | null;
    avatar_url: string | null; is_verified: number; created_at: string; last_login_at: string | null;
  };

  const { accessToken, refreshToken } = issueTokens(userId, user.email);

  res.status(201).json({
    user:          buildUserResponse(user),
    access_token:  accessToken,
    refresh_token: refreshToken,
    token_type:    'Bearer',
  });
});

// ─── POST /auth/login ─────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const { email, password } = parsed.data;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as {
    id: string; email: string; password_hash: string; display_name: string;
    phone: string | null; avatar_url: string | null; is_verified: number;
    is_banned: number; created_at: string; last_login_at: string | null;
  } | undefined;

  // Constant-time check even if user not found (prevents timing attacks)
  const passwordMatch = user
    ? await bcrypt.compare(password, user.password_hash)
    : await bcrypt.compare(password, '$2b$12$invalidhashfortimingnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn');

  if (!user || !passwordMatch) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  if (user.is_banned === 1) {
    res.status(403).json({ error: 'This account has been suspended' });
    return;
  }

  // Update last_login_at
  db.prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`)
    .run(new Date().toISOString(), user.id);

  const { accessToken, refreshToken } = issueTokens(user.id, user.email);

  res.status(200).json({
    user:          buildUserResponse(user),
    access_token:  accessToken,
    refresh_token: refreshToken,
    token_type:    'Bearer',
  });
});

// ─── POST /auth/refresh ───────────────────────────────────────────
router.post('/refresh', (req: Request, res: Response): void => {
  const parsed = RefreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'refresh_token is required' });
    return;
  }

  const { refresh_token } = parsed.data;
  const tokenHash = hashRefreshToken(refresh_token);

  const stored = db.prepare(`
    SELECT rt.*, u.email, u.is_banned
    FROM refresh_tokens rt
    JOIN users u ON u.id = rt.user_id
    WHERE rt.token_hash = ?
  `).get(tokenHash) as {
    id: string; user_id: string; email: string; expires_at: string;
    revoked_at: string | null; is_banned: number;
  } | undefined;

  if (!stored) {
    res.status(401).json({ error: 'Invalid refresh token' });
    return;
  }

  if (stored.revoked_at) {
    // Token reuse detected — revoke ALL tokens for this user (potential theft)
    db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE user_id = ?`)
      .run(new Date().toISOString(), stored.user_id);
    res.status(401).json({ error: 'Refresh token already used. Please log in again.' });
    return;
  }

  if (new Date(stored.expires_at) < new Date()) {
    res.status(401).json({ error: 'Refresh token expired. Please log in again.' });
    return;
  }

  if (stored.is_banned === 1) {
    res.status(403).json({ error: 'This account has been suspended' });
    return;
  }

  // Rotate: revoke old token, issue new pair
  db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE id = ?`)
    .run(new Date().toISOString(), stored.id);

  const { accessToken, refreshToken: newRefresh } = issueTokens(stored.user_id, stored.email);

  res.status(200).json({
    access_token:  accessToken,
    refresh_token: newRefresh,
    token_type:    'Bearer',
  });
});

// ─── POST /auth/logout ────────────────────────────────────────────
router.post('/logout', (req: Request, res: Response): void => {
  const parsed = RefreshSchema.safeParse(req.body);

  if (parsed.success) {
    const tokenHash = hashRefreshToken(parsed.data.refresh_token);
    db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ?`)
      .run(new Date().toISOString(), tokenHash);
  }

  // Always return 200 — client should drop tokens regardless
  res.status(200).json({ message: 'Logged out successfully' });
});

// ─── GET /auth/me ─────────────────────────────────────────────────
router.get('/me', requireAuth, (req: Request, res: Response): void => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.userId) as {
    id: string; email: string; display_name: string; phone: string | null;
    avatar_url: string | null; is_verified: number; created_at: string; last_login_at: string | null;
  } | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json({ user: buildUserResponse(user) });
});

// ─── PATCH /auth/me ───────────────────────────────────────────────
const UpdateProfileSchema = z.object({
  display_name: z.string().min(2).max(60).optional(),
  phone:        z.string().regex(/^\+?[\d\s\-()]{7,20}$/).optional().nullable(),
});

router.patch('/me', requireAuth, (req: Request, res: Response): void => {
  const parsed = UpdateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    return;
  }

  const updates = parsed.data;
  const fields: string[]  = [];
  const values: unknown[] = [];

  if (updates.display_name !== undefined) { fields.push('display_name = ?'); values.push(updates.display_name.trim()); }
  if (updates.phone        !== undefined) { fields.push('phone = ?');        values.push(updates.phone);               }

  if (fields.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  values.push(req.user!.userId);
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.userId) as {
    id: string; email: string; display_name: string; phone: string | null;
    avatar_url: string | null; is_verified: number; created_at: string; last_login_at: string | null;
  };

  res.status(200).json({ user: buildUserResponse(user) });
});

export default router;
