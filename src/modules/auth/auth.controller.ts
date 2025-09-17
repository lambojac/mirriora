import { Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import * as userService from "./auth.service";
import { 
  verifyOTPService,
  handlePasswordResetRequest, 
  handleOTPVerification, 
  handlePasswordReset,
  getUserProfileData,
  changeUserPassword,
  deleteUserPermanently,
  getUserById,
  resendEmailVerificationOTP,
  resendPasswordResetOTP,
  editUserProfile
} from "./auth.service";
import { isEmail, isValidPhoneNumber } from '../../helpers/validation';

// Registration 
export const registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, phoneNumber, password } = req.body;

  if (!fullName || !password) {
    res.status(400).json({
      success: false,
      message: "Full name and password are required."
    });
    return;
  }

  if (!email && !phoneNumber) {
    res.status(400).json({
      success: false,
      message: "Either email or phone number is required."
    });
    return;
  }

  if (email && !isEmail(email)) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid email address."
    });
    return;
  }

  if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid phone number."
    });
    return;
  }

  try {
    const result = await userService.register(req.body);
    
    res.status(result.status).json({
      success: result.status === 201,
      ...result.data,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred during registration."
      });
    }
  }
});

// Login
export const loginUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400).json({
      success: false,
      message: "Identifier (email/phone) and password are required."
    });
    return;
  }

  try {
    const result = await userService.login({ identifier, password }, res);
    res.status(result.status).json({
      success: result.status === 200,
      ...result.data
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred during login."
      });
    }
  }
});

// Logout
export const logOut = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ 
    success: true,
    message: "You have successfully logged out." 
  });
});

// Verify OTP
export const verifyOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    res.status(400).json({
      success: false,
      message: "Identifier (email/phone) and OTP are required."
    });
    return;
  }

  // Validate OTP format
  if (!/^\d{6}$/.test(otp)) {
    res.status(400).json({
      success: false,
      message: "OTP must be a 6-digit number."
    });
    return;
  }

  try {  
    const message = await verifyOTPService(identifier, otp);
    res.status(200).json({ 
      success: true,
      message 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred."
      });
    }
  }
});
  
// Request Password Reset
export const requestPasswordReset = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { identifier } = req.body as { identifier?: string };

  if (!identifier) {
    res.status(400).json({
      success: false,
      message: "Email or phone number is required."
    });
    return;
  }

  // Validate identifier format
  if (!isEmail(identifier) && !isValidPhoneNumber(identifier)) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid email address or phone number."
    });
    return;
  }
  
  try {
    const result = await handlePasswordResetRequest(identifier);
    res.status(200).json({ 
      success: result.success,
      message: result.message 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while processing password reset request."
      });
    }
  }
});

// Verify Reset OTP
export const verifyResetOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { otp } = req.body as { otp?: string };

  if (!otp) {
    res.status(400).json({
      success: false,
      message: "OTP is required."
    });
    return;
  }

  // Basic OTP validation
  if (!/^\d{6}$/.test(otp)) {
    res.status(400).json({
      success: false,
      message: "OTP must be a 6-digit number."
    });
    return;
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
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while verifying OTP."
      });
    }
  }
});

// Reset Password
export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { password, confirmPassword, userIdentifier } = req.body as {
    password?: string;
    confirmPassword?: string;
    userIdentifier?: string; 
  };

  if (!password || !confirmPassword) {
    res.status(400).json({
      success: false,
      message: "Both password and confirm password are required."
    });
    return;
  }

  if (!userIdentifier) {
    res.status(400).json({
      success: false,
      message: "User identifier is required. Please verify OTP first."
    });
    return;
  }

  try {
    const result = await handlePasswordReset(password, confirmPassword, userIdentifier);
    res.status(200).json({ 
      success: result.success,
      message: result.message 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while resetting password."
      });
    }
  }
});

// Get User Profile
export const getUserProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!userId) {
    res.status(400).json({
      success: false,
      message: "User ID is required."
    });
    return;
  }

  try {
    const user = await getUserProfileData(userId);
    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully.",
      data: user
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while fetching user profile."
      });
    }
  }
});

// Change Password
export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!userId) {
    res.status(400).json({
      success: false,
      message: "User ID is required."
    });
    return;
  }

  if (!newPassword || !confirmPassword) {
    res.status(400).json({
      success: false,
      message: "New password and confirm password are required."
    });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long."
    });
    return;
  }

  try {
    const result = await changeUserPassword(userId, newPassword, confirmPassword);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while changing password."
      });
    }
  }
});

// Delete User Account
export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { password } = req.body;

  if (!userId) {
    res.status(400).json({
      success: false,
      message: "User ID is required."
    });
    return;
  }

  if (!password) {
    res.status(400).json({
      success: false,
      message: "Password is required to delete account."
    });
    return;
  }

  try {
    const result = await deleteUserPermanently(userId, password);
    res.status(200).json({
      success: result.success,
      message: result.message
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while deleting account."
      });
    }
  }
});

// Get User By ID
export const getUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!userId) {
    res.status(400).json({
      success: false,
      message: "User ID is required."
    });
    return;
  }

  try {
    const result = await getUserById(userId);
    res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      data: result.user
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while fetching user."
      });
    }
  }
});

// Resend Email Verification OTP
export const resendVerificationOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { identifier } = req.body;

  if (!identifier) {
    res.status(400).json({
      success: false,
      message: "Email or phone number is required."
    });
    return;
  }

  if (!isEmail(identifier) && !isValidPhoneNumber(identifier)) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid email address or phone number."
    });
    return;
  }

  try {
    const result = await resendEmailVerificationOTP(identifier);
    res.status(200).json({
      success: result.success,
      message: result.message
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while resending verification OTP."
      });
    }
  }
});

// Resend Password Reset OTP
export const resendPasswordResetOTPController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { identifier } = req.body;

  if (!identifier) {
    res.status(400).json({
      success: false,
      message: "Email or phone number is required."
    });
    return;
  }

  if (!isEmail(identifier) && !isValidPhoneNumber(identifier)) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid email address or phone number."
    });
    return;
  }

  try {
    const result = await resendPasswordResetOTP(identifier);
    res.status(200).json({
      success: result.success,
      message: result.message
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while resending password reset OTP."
      });
    }
  }
});


// controller
export const updateUserProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { fullName, email, phoneNumber } = req.body;

  if (!userId) {
    res.status(400).json({
      success: false,
      message: "User ID is required.",
    });
    return;
  }

  try {
    const updatedUser = await editUserProfile(userId, { fullName, email, phoneNumber });
    res.status(200).json({
      success: true,
      message: "User profile updated successfully.",
      data: updatedUser,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Unexpected error occurred." });
    }
  }
});
