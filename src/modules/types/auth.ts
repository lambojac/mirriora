import { ObjectId } from "mongoose";
import { Request } from "express";

export interface RegisterBody {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface LoginBody {
  identifier: string; // Can be email or phone number
  password: string;
}

export interface IUser {  
  id: string;
  deactivatedAt?: Date;
  createdAt?: Date;
  resetTokenVerified?: boolean;
  email?: string;
  phoneNumber?: string;
  password: string;
  confirm_password?: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationExpires?: Date;
  resetTokenExpires?: Date;
  fullName: string;
  otp?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface DecodedToken {
  id: string;
  [key: string]: string;
}