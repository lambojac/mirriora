import { Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import * as userService from "./auth.service";
import { verifyOTPService } from "./auth.service";
import { handlePasswordResetRequest, handleOTPVerification, handlePasswordReset } from "./auth.service";
import { isEmail,isValidPhoneNumber } from '../../helpers/validation';


// registration 
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, phoneNumber, password } = req.body;

  if (!fullName || !password) {
    res.status(400);
    throw new Error("Full name and password are required.");
  }

  if (!email && !phoneNumber) {
    res.status(400);
    throw new Error("Either email or phone number is required.");
  }

  if (email && !isEmail(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }

  if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
    res.status(400);
    throw new Error("Please provide a valid phone number.");
  }

  const result = await userService.register(req.body);
  
  res.status(result.status).json({
    ...result.data,
  });
});

// login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400);
    throw new Error("Identifier (email/phone) and password are required.");
  }

  const result = await userService.login({ identifier, password }, res);
  res.status(result.status).json(result.data);
});

// logout
export const logOut = asyncHandler(async (_req: Request, res: Response) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "You have successfully logged out." });
});

// verifyotp
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    res.status(400);
    throw new Error("Identifier (email/phone) and OTP are required.");
  }

  // Validate OTP format
  if (!/^\d{6}$/.test(otp)) {
    res.status(400);
    throw new Error("OTP must be a 6-digit number.");
  }

  try {  
    const message = await verifyOTPService(identifier, otp);
    res.status(200).json({ 
      success: true,
      message 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400);
      throw new Error(error.message);
    } else {
      res.status(500);
      throw new Error("An unexpected error occurred.");
    }
  }
});
  
// requestPasswordReset
export const requestPasswordReset = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { identifier } = req.body as { identifier?: string };

  if (!identifier) {
    res.status(400);
    throw new Error("Email or phone number is required.");
  }

  // Validate identifier format
  if (!isEmail(identifier) && !isValidPhoneNumber(identifier)) {
    res.status(400);
    throw new Error("Please provide a valid email address or phone number.");
  }
  
  try {
    const result = await handlePasswordResetRequest(identifier);
    res.status(200).json({ 
      success: result.success,
      message: result.message 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400);
      throw new Error(error.message);
    } else {
      res.status(500);
      throw new Error("An unexpected error occurred while processing password reset request.");
    }
  }
});

// Verify reset OTP
export const verifyResetOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { otp } = req.body as { otp?: string };

  if (!otp) {
    res.status(400);
    throw new Error("OTP is required.");
  }

  // Basic OTP validation
  if (!/^\d{6}$/.test(otp)) {
    res.status(400);
    throw new Error("OTP must be a 6-digit number.");
  }

  try {
    const result = await handleOTPVerification(otp);
    res.status(200).json({ 
      success: result.success,
      message: result.message,
      data: {
        userId: result.userId,
        identifier: result.identifier
      }
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400);
      throw new Error(error.message);
    } else {
      res.status(500);
      throw new Error("An unexpected error occurred while verifying OTP.");
    }
  }
});

// Reset password
export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { password, confirmPassword, userIdentifier } = req.body as {
    password?: string;
    confirmPassword?: string;
    userIdentifier?: string; 
  };

  if (!password || !confirmPassword) {
    res.status(400);
    throw new Error("Both password and confirm password are required.");
  }

  if (!userIdentifier) {
    res.status(400);
    throw new Error("User identifier is required. Please verify OTP first.");
  }

  try {
    const result = await handlePasswordReset(password, confirmPassword, userIdentifier);
    res.status(200).json({ 
      success: result.success,
      message: result.message 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400);
      throw new Error(error.message);
    } else {
      res.status(500);
      throw new Error("An unexpected error occurred while resetting password.");
    }
  }
});