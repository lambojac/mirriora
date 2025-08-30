import { User } from "./auth"; 
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        phoneNumber?: string;
        fullName?: string;
        isVerified?: boolean;
        [key: string]: any;
      };
    }
  }
}

export {};
