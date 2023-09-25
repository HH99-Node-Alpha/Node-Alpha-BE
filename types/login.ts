// types/express.d.ts

import { Request } from 'express';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CustomExpressRequest extends Request {
  user?: any;
}
