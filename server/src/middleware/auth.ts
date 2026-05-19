import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt';

// Extend Express Request so routes get req.user typed
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err: unknown) {
    const isExpired = err instanceof Error && err.message.includes('expired');
    res.status(401).json({
      error: isExpired ? 'Access token expired' : 'Invalid access token',
      code:  isExpired ? 'TOKEN_EXPIRED'        : 'TOKEN_INVALID',
    });
  }
}

// Optional auth — attaches user if token present but doesn't block if absent
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(authHeader.slice(7));
    } catch {
      // silently ignore — route will treat as unauthenticated
    }
  }
  next();
}
