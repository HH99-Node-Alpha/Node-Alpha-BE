import { Request } from 'express';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CustomExpressRequest extends Request {
  user?: any;
}

declare global {
  namespace Express {
  interface User {
  userId: number;
  name?: string;
  password?: string | null;
  profileUrl?: string | null;
  kakaoLoggedInToken?: string | null;
  googleLoggedInToken?: string | null;
  }
  }
  }
