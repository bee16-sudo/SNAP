export interface User {
  id: string;
  email: string;
  display_name: string;
  phone?: string;
  avatar_url?: string;
  is_verified: boolean;
  is_banned?: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface RegisterBody {
  email: string;
  password: string;
  display_name: string;
  phone?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'is_banned'>;
  accessToken: string;
}
