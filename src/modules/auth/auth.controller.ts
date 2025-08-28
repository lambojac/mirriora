import { Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import * as userService from "./auth.service";
import {  verifyOTPService } from "./auth.service";
import {
    handlePasswordResetRequest,
    handleOTPVerification,
    handlePasswordReset
  } from "./auth.service";

import User from "../../modules/schemas/user";



// registration 
export const registerUser = asyncHandler(async (req: Request, res: Response) => {

  const result = await userService.register(req.body);
  
  // Include account type in response
  res.status(result.status).json({
    ...result.data,
    
  });
});

// login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.login(req.body, res);
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
    const { email, otp } = req.body;
  
    try {  
      const message = await verifyOTPService(email, otp);
      res.status(200).json({ message });
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
  
// reqestpasswordreset
  
  export const requestPasswordReset = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email?: string };

  if (!email) {
    res.status(400);
    throw new Error("Email is required.");
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }

  try {
    const result = await handlePasswordResetRequest(email);
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
        email: result.email
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




  export const requestChangePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { currentPassword } = req.body as { currentPassword?: string };
    const user = req.user?.id as string;  
  
    if (!currentPassword) {
      res.status(400);
      throw new Error("Current Password required.");
    }     

    const result = await userService.requestChangeUserPassword(user, currentPassword);
    res.status(200).json({message: "Password changed successfully." });
  });

  export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { password, confirmPassword } = req.body as {
      password?: string;
      confirmPassword?: string;
    };  
    const user = req.user?.id as string;  

    if (!password || !confirmPassword) {
      res.status(400);
      throw new Error("Both new password and confirm new password are required.");
    }

    if (password !== confirmPassword) {
      res.status(400);
      throw new Error("New password and confirm new password do not match.");
    }

    await userService.changeUserPassword(user, password, confirmPassword);
    res.status(200).json({ message: "Password changed successfully." });
  });

 





  export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    res.status(401);
    throw new Error("User not authenticated."); 
  }
  
  const { password } = req.body as { password?: string };
  
  if (!password) {
    res.status(400);
    throw new Error("Password is required to delete account.");
  }
  
  try {
    const result = await userService.deleteUserPermanently(userId, password);
    
    // Clear the authentication cookie
    res.cookie("token", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
      sameSite: "none",
      secure: true,
    });
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400);
      throw new Error(error.message);
    } else {
      res.status(500);
      throw new Error("An unexpected error occurred while deleting account.");
    }
  }
});








// Get user profile/details (excluding password)
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    res.status(401);
    throw new Error("User not authenticated.");
  }
  
  try {
    const user = await userService.getUserById(userId);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400);
      throw new Error(error.message);
    } else {
      res.status(500);
      throw new Error("An unexpected error occurred while fetching user profile.");
    }
  }
});

// Resend OTP for email verification
export const resendVerificationOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  
  if (!email) {
    res.status(400);
    throw new Error("Email is required.");
  }
  
  try {
    await userService.resendEmailVerificationOTP(email);
    res.status(200).json({ 
      success: true,
      message: "Verification OTP has been resent to your email." 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400);
      throw new Error(error.message);
    } else {
      res.status(500);
      throw new Error("An unexpected error occurred while resending verification OTP.");
    }
  }
});

// Resend OTP for password reset
export const resendPasswordResetOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  
  if (!email) {
    res.status(400);
    throw new Error("Email is required.");
  }
  
  try {
    await userService.resendPasswordResetOTP(email);
    res.status(200).json({ 
      success: true,
      message: "Password reset OTP has been resent to your email." 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400);
      throw new Error(error.message);
    } else {
      res.status(500);
      throw new Error("An unexpected error occurred while resending password reset OTP.");
    }
  }
});







