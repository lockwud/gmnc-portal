import type { SessionUser } from '@/lib/validators/auth';

export type LoginRequest = {
  identifier: string;
  password: string;
};

export type BackendLoginResponse = Record<string, unknown>;

export type LoginResult = {
  accessToken: string;
  user: SessionUser;
  raw: BackendLoginResponse;
};