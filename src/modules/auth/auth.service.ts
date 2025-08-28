import bcrypt from "bcrypt";
import { Response } from "express";
import User from "../../modules/schemas/user";
import genToken from "../../modules/utils/tokenGen";
import { changePasswordEmail,   sendVerificationEmail } from "../../modules/utils/emailService";
import { RegisterBody, LoginBody } from "../../modules/types/auth";
import { generateOTP, sendOTP } from "../../modules/utils/otpMailer";

// register
export const register = async (body: RegisterBody) => {
  const { fullName, phoneNumber, email, password} = body;

  if (!fullName  || !password) {
    return { status: 400, data: { message: "Please provide all required fields." } };
  }

  

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { status: 400, data: { message: "User with this email already exists." } };
  }
  const existingUserName=await User.findOne({fullName})
  if(existingUserName){
    return { status: 400, data: { message: "User with this username already exists." } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    email,
    password: hashedPassword,
    verificationCode,
    verificationExpires,
    isVerified: false,
    
  });

  await sendVerificationEmail(email, verificationCode);

   return {
    status: 201,
    data: {
      message: "Registration successful. Please verify your email.",
      userId: user._id,
      user: {
        id: user._id,
       fullName: user.fullName,
        email: user.email,
        isVerified: user.isVerified
      }
    },
  };
};
// login
export const login = async (body: LoginBody, res: Response) => {
  const { email, password, phoneNumber } = body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) return { status: 400, data: { message: "User not found." } };
  if (!user.isVerified) return { status: 400, data: { message: "Please verify your email." } };

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return { status: 400, data: { message: "Invalid credentials." } };


  const token = genToken(String(user._id));
  res.cookie("token", token, {   
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    sameSite: "none",
    secure: true,     
  });

  return {
    status: 200,
    data: {
      id: user._id,
      userName: user.userName,
      email: user.email,
      token,

    },
  };
};


// verfiyOtpservice
export const verifyOTPService = async (email: string, otp: string): Promise<string> => {
  if (!email || !otp) {
    throw new Error("Email and OTP are required.");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.isVerified) {
    throw new Error("User is already verified.");
  }

  if (user.verificationCode !== otp) {
    throw new Error("Invalid OTP.");
  }

  if (!user.verificationExpires || new Date() > new Date(user.verificationExpires)) {
    throw new Error("OTP has expired. Please request a new one.");
  }
  

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationExpires = undefined;
  await user.save();

  return "Email verified successfully. You can now log in.";
};



// handlepasswordreset
export const handlePasswordResetRequest = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your email first before resetting password.");
  }

  if (user.isDeactivated) {
    throw new Error("Account is deactivated. Please contact support.");
  }

  const otp = generateOTP();
  user.resetToken = otp;
  user.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); 
  await user.save();

  await sendOTP(email, otp);
  
  return {
    success: true,
    message: "OTP sent to your email."
  };
};

// Updated handleOTPVerification 
export const handleOTPVerification = async (otp: string) => {
  const user = await User.findOne({ resetToken: otp });

  if (!user || (user.resetTokenExpires && new Date() > user.resetTokenExpires)) {
    throw new Error("Invalid or expired OTP.");
  }

  
  user.resetTokenVerified = true; 
  await user.save();
  
  return {
    userId: user._id,
    email: user.email,
    success: true,
    message: "OTP verified successfully. You can now reset your password."
  };
};


export const handlePasswordReset = async (
  password: string, 
  confirmPassword: string, 
  userIdentifier: string 
) => {
  if (!password || !confirmPassword) {
    throw new Error("Both password and confirm password are required.");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  // Basic password validation
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }


  const user = await User.findOne({
    $or: [
      { email: userIdentifier }
    ],
    resetToken: { $ne: null },
    resetTokenVerified: true
  });

  if (!user) {
    throw new Error("Invalid password reset session. Please restart the password reset process.");
  }

  // Check if reset token is still valid
  if (user.resetTokenExpires && new Date() > user.resetTokenExpires) {
    throw new Error("Password reset session has expired. Please restart the process.");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  
  // Clear reset token fields
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  user.resetTokenVerified = undefined;
  
  await user.save();
  
  return {
    success: true,
    message: "Password has been reset successfully."
  };
};

// get user profile
export const getUserProfileData = async (user: string) => {
  const userData = await User.findById(user).select("-password -verificationCode -verificationExpires -resetToken -resetTokenExpires").lean();
  if (!userData) {
    throw new Error("User not found.");
  }
  return user;
}



export const requestChangeUserPassword = async (userId: string, currentPassword: string) => {

  const user = await User.findById(userId).select("+password");  
  if (!user) {
    throw new Error("User not found.");
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw new Error("Invalid current password.");
  }

  // send otp to user email
  const otp = generateOTP();
  user.otp = otp;
  await user.save();

  await changePasswordEmail(user.email, otp);

  return {message: "OTP sent to your email for password change."
  };
  
}

export const changeUserPassword = async (userId: string, newPassword: string, confirmPassword: string) => {


  const user = await User.findById(userId).select("+otp");
  if (!user) {
    throw new Error("User not found.");
  }

  // if (user.otp !== otp) {
  //   throw new Error("Invalid OTP.");
  // }

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  // user.otp = "";
  await user.save();

  return {message: "Password changed successfully."
  };

}


  

export const requestUserDeleteAccount = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  // send otp to user email
  const otp = generateOTP();
  user.otp = otp;
  await user.save();

  await deleteUserAccount(user.email, otp);

  return {message: "OTP sent to your email for account deletion."
  };
}





// Permanently delete user account


export const deleteUserPermanently = async (userId: string, password: string) => {
  try {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new Error("User not found.");
    }

    // Check if account is already deactivated
    if (user.isDeactivated) {
      throw new Error("Cannot delete deactivated account. Please reactivate first or contact support.");
    }

    // Verify password before deletion
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid password. Account deletion cancelled.");
    }

    // Permanently delete the user
    await User.findByIdAndDelete(userId);

    return {
      success: true,
      message: "Account has been permanently deleted. All data has been removed."
    };
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};






// Get user by ID (excluding password)
export const getUserById = async (userId: string) => {
  try {
    const user = await User.findById(userId).select('-password -resetToken -resetTokenExpires -verificationCode -verificationExpires');
    
    if (!user) {
      throw new Error("User not found.");
    }
    
    return {
      user
    
    };
    
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Resend email verification OTP
export const resendEmailVerificationOTP = async (email: string) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error("User not found with this email address.");
    }
    
    if (user.isVerified) {
      throw new Error("Email is already verified.");
    }
    
    // Check if there's a recent OTP (prevent spam)
    if (user.verificationExpires && new Date() < new Date(user.verificationExpires)) {
      const timeLeft = Math.ceil((new Date(user.verificationExpires).getTime() - Date.now()) / (1000 * 60));
      throw new Error(`Please wait ${timeLeft} minutes before requesting a new OTP.`);
    }
    
    // Generate new OTP
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); 
    
    user.verificationCode = verificationCode;
    user.verificationExpires = verificationExpires;
    await user.save();
    
    await sendVerificationEmail(email, verificationCode);
    
    return {
      success: true,
      message: "Verification OTP has been resent to your email."
    };
    
  } catch (error) {
    console.error("Error resending email verification OTP:", error);
    throw error;
  }
};

// Resend password reset OTP
export const resendPasswordResetOTP = async (email: string) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error("User not found with this email address.");
    }
    
    if (!user.isVerified) {
      throw new Error("Please verify your email first before resetting password.");
    }
    
    if (user.isDeactivated) {
      throw new Error("Account is deactivated. Please contact support.");
    }
    
    // Check if there's a recent OTP (prevent spam)
    if (user.resetTokenExpires && new Date() < new Date(user.resetTokenExpires)) {
      const timeLeft = Math.ceil((new Date(user.resetTokenExpires).getTime() - Date.now()) / (1000 * 60));
      throw new Error(`Please wait ${timeLeft} minutes before requesting a new OTP.`);
    }
    
    // Generate new OTP
    const otp = generateOTP();
    user.resetToken = otp;
    user.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    
    await sendOTP(email, otp);
    
    return {
      success: true,
      message: "Password reset OTP has been resent to your email."
    };
    
  } catch (error) {
    console.error("Error resending password reset OTP:", error);
    throw error;
  }
};

