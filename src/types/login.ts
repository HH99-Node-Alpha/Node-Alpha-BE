// types/express.d.ts

export interface LoginRequest {
    email: string;
    password: string;
  }

  declare global {
    namespace Express {
      interface User {
        userId: number;
      }
    }
  }