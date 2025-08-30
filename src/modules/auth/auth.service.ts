import bcrypt from "bcryptjs";
import { Response } from "express";
import { supabase } from "../../config/dbConn";
import genToken from "../../modules/utils/tokenGen";
import { sendVerificationEmail } from "../../modules/utils/emailService";
import { RegisterBody, LoginBody, IUser } from "../../modules/types/auth";
import { generateOTP, sendOTP } from "../../modules/utils/otpMailer";
import { isEmail, isValidPhoneNumber } from "../../helpers/validation";

export const register = async (body: RegisterBody) => {
  const { fullName, phoneNumber, email, password } = body;

  if (!fullName || !password) {
    return { status: 400, data: { message: "Please provide all required fields." } };
  }

  if (!email && !phoneNumber) {
    return { status: 400, data: { message: "Please provide either email or phone number." } };
  }

  if (email && !isEmail(email)) {
    return { status: 400, data: { message: "Please provide a valid email address." } };
  }

  if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
    return { status: 400, data: { message: "Please provide a valid phone number." } };
  }

  try {
    // Check for existing user with email
    if (email) {
      const { data: existingEmailUser, error: emailCheckError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .limit(1);

      if (emailCheckError) {
        console.error('Error checking existing email:', emailCheckError);
        return { 
          status: 500, 
          data: { message: "Database error occurred while checking email existence." } 
        };
      }

      if (existingEmailUser && existingEmailUser.length > 0) {
        return { status: 400, data: { message: "User with this email already exists." } };
      }
    }

    // Check for existing user with phone number
    if (phoneNumber) {
      const { data: existingPhoneUser, error: phoneCheckError } = await supabase
        .from('users')
        .select('id, phone_number')
        .eq('phone_number', phoneNumber)
        .limit(1);

      if (phoneCheckError) {
        console.error('Error checking existing phone:', phoneCheckError);
        return { 
          status: 500, 
          data: { message: "Database error occurred while checking phone number existence." } 
        };
      }

      if (existingPhoneUser && existingPhoneUser.length > 0) {
        return { status: 400, data: { message: "User with this phone number already exists." } };
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Insert new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        full_name: fullName,
        email: email || null,
        phone_number: phoneNumber || null,
        password: hashedPassword,
        verification_code: verificationCode,
        verification_expires: verificationExpires.toISOString(),
        is_verified: false,
      }])
      .select('id, full_name, email, phone_number, is_verified')
      .single();

    if (error) {
      console.error('Error creating user:', error);
      
      // Handle specific Supabase/PostgreSQL errors
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('email')) {
          return { status: 400, data: { message: "User with this email already exists." } };
        }
        if (error.message.includes('phone_number') || error.message.includes('phone')) {
          return { status: 400, data: { message: "User with this phone number already exists." } };
        }
        return { status: 400, data: { message: "User with these credentials already exists." } };
      }
      
      if (error.code === '23502') { // Not null constraint violation
        return { status: 400, data: { message: "Required field is missing." } };
      }
      
      if (error.code === '23514') { // Check constraint violation
        return { status: 400, data: { message: "Invalid data format provided." } };
      }
      
      // Handle connection or permission errors
      if (error.message?.toLowerCase().includes('connection') || 
          error.message?.toLowerCase().includes('timeout')) {
        return { status: 503, data: { message: "Database connection error. Please try again later." } };
      }
      
      if (error.message?.toLowerCase().includes('permission') || 
          error.message?.toLowerCase().includes('access')) {
        return { status: 500, data: { message: "Database access error. Please contact support." } };
      }
      
      // Generic database error with more specific message
      return { 
        status: 500, 
        data: { 
          message: "Failed to create user account. Please try again.", 
          ...(process.env.NODE_ENV === 'development' && { 
            errorDetails: error.message,
            errorCode: error.code 
          })
        } 
      };
    }

    // Send verification
    try {
      if (email) {
        await sendVerificationEmail(email, verificationCode);
      } else if (phoneNumber) {
        console.log(`SMS verification code for ${phoneNumber}: ${verificationCode}`);
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // User is created but email failed - still return success with a note
      return {
        status: 201,
        data: {
          message: `Registration successful but verification ${email ? 'email' : 'SMS'} failed to send. Please use resend verification option.`,
          userId: newUser.id,
          user: {
            id: newUser.id,
            fullName: newUser.full_name,
            email: newUser.email,
            phoneNumber: newUser.phone_number,
            isVerified: newUser.is_verified
          },
          verificationSent: false
        },
      };
    }

    return {
      status: 201,
      data: {
        message: `Registration successful. Please verify your ${email ? 'email' : 'phone number'}.`,
        userId: newUser.id,
        user: {
          id: newUser.id,
          fullName: newUser.full_name,
          email: newUser.email,
          phoneNumber: newUser.phone_number,
          isVerified: newUser.is_verified
        },
        verificationSent: true
      },
    };

  } catch (error) {
    console.error('Unexpected error during registration:', error);
    return { 
      status: 500, 
      data: { 
        message: "An unexpected error occurred during registration. Please try again.",
        ...(process.env.NODE_ENV === 'development' && error instanceof Error && { 
          errorDetails: error.message 
        })
      } 
    };
  }
};
// login
export const login = async (body: LoginBody, res: Response) => {
  const { identifier, password } = body;

  if (!identifier || !password) {
    return { status: 400, data: { message: "Please provide identifier and password." } };
  }

  // Find user by email or phone
  const column = isEmail(identifier) ? 'email' : 'phone_number';
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, email, phone_number, password, is_verified, is_deactivated')
    .eq(column, identifier)
    .limit(1);

  if (error || !users || users.length === 0) {
    return { status: 400, data: { message: "User not found." } };
  }

  const user = users[0];

  if (!user.is_verified) {
    return { status: 400, data: { message: "Please verify your account first." } };
  }

  if (user.is_deactivated) {
    return { status: 400, data: { message: "Account is deactivated. Please contact support." } };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { status: 400, data: { message: "Invalid credentials." } };
  }

  const token = genToken(user.id);
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
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phoneNumber: user.phone_number,
      token,
    },
  };
};

export const verifyOTPService = async (identifier: string, otp: string): Promise<string> => {
  if (!identifier || !otp) {
    throw new Error("Identifier and OTP are required.");
  }

  const column = isEmail(identifier) ? 'email' : 'phone_number';
  const { data: users, error } = await supabase
    .from('users')
    .select('id, is_verified, verification_code, verification_expires')
    .eq(column, identifier)
    .limit(1);

  if (error || !users || users.length === 0) {
    throw new Error("User not found.");
  }

  const user = users[0];

  if (user.is_verified) {
    throw new Error("User is already verified.");
  }

  if (user.verification_code !== otp) {
    throw new Error("Invalid OTP.");
  }

  if (!user.verification_expires || new Date() > new Date(user.verification_expires)) {
    throw new Error("OTP has expired. Please request a new one.");
  }

  // Update user verification status
  const { error: updateError } = await supabase
    .from('users')
    .update({
      is_verified: true,
      verification_code: null,
      verification_expires: null,
    })
    .eq('id', user.id);

  if (updateError) {
    throw new Error("Error updating user verification status.");
  }

  return "Account verified successfully. You can now log in.";
};

// handlePasswordResetRequest
export const handlePasswordResetRequest = async (identifier: string) => {
  const column = isEmail(identifier) ? 'email' : 'phone_number';
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, phone_number, is_verified, is_deactivated')
    .eq(column, identifier)
    .limit(1);

  if (error || !users || users.length === 0) {
    throw new Error("User not found.");
  }

  const user = users[0];

  if (!user.is_verified) {
    throw new Error("Please verify your account first before resetting password.");
  }

  if (user.is_deactivated) {
    throw new Error("Account is deactivated. Please contact support.");
  }

  const otp = generateOTP();
  const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

  const { error: updateError } = await supabase
    .from('users')
    .update({
      reset_token: otp,
      reset_token_expires: resetTokenExpires.toISOString(),
      reset_token_verified: false,
    })
    .eq('id', user.id);

  if (updateError) {
    throw new Error("Error generating password reset token.");
  }

  // Send OTP
  if (user.email && isEmail(identifier)) {
    await sendOTP(user.email, otp);
  } else if (user.phone_number) {
    console.log(`SMS reset code for ${user.phone_number}: ${otp}`);
  }
  
  return {
    success: true,
    message: "OTP sent to your registered contact method."
  };
};

export const handleOTPVerification = async (otp: string) => {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, phone_number, reset_token_expires')
    .eq('reset_token', otp)
    .limit(1);

  if (error || !users || users.length === 0) {
    throw new Error("Invalid OTP.");
  }

  const user = users[0];

  if (user.reset_token_expires && new Date() > new Date(user.reset_token_expires)) {
    throw new Error("OTP has expired.");
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ reset_token_verified: true })
    .eq('id', user.id);

  if (updateError) {
    throw new Error("Error verifying OTP.");
  }
  
  return {
    userId: user.id,
    identifier: user.email || user.phone_number,
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

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const column = isEmail(userIdentifier) ? 'email' : 'phone_number';
  const { data: users, error } = await supabase
    .from('users')
    .select('id, reset_token, reset_token_expires, reset_token_verified')
    .eq(column, userIdentifier)
    .not('reset_token', 'is', null)
    .eq('reset_token_verified', true)
    .limit(1);

  if (error || !users || users.length === 0) {
    throw new Error("Invalid password reset session. Please restart the password reset process.");
  }

  const user = users[0];

  if (user.reset_token_expires && new Date() > new Date(user.reset_token_expires)) {
    throw new Error("Password reset session has expired. Please restart the process.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { error: updateError } = await supabase
    .from('users')
    .update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
      reset_token_verified: null,
    })
    .eq('id', user.id);

  if (updateError) {
    throw new Error("Error resetting password.");
  }
  
  return {
    success: true,
    message: "Password has been reset successfully."
  };
};

export const getUserProfileData = async (userId: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, full_name, email, phone_number, is_verified, is_deactivated, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error("User not found.");
  }

  return user;
};

export const changeUserPassword = async (userId: string, newPassword: string, confirmPassword: string) => {
  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const { error } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('id', userId);

  if (error) {
    throw new Error("Error changing password.");
  }

  return { message: "Password changed successfully." };
};

export const deleteUserPermanently = async (userId: string, password: string) => {
  try {
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, password, is_deactivated')
      .eq('id', userId)
      .limit(1);

    if (fetchError || !users || users.length === 0) {
      throw new Error("User not found.");
    }

    const user = users[0];

    if (user.is_deactivated) {
      throw new Error("Cannot delete deactivated account. Please reactivate first or contact support.");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid password. Account deletion cancelled.");
    }

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      throw new Error("Error deleting user account.");
    }

    return {
      success: true,
      message: "Account has been permanently deleted. All data has been removed."
    };
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};

export const getUserById = async (userId: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone_number, is_verified, is_deactivated, created_at, updated_at')
      .eq('id', userId)
      .single();
    
    if (error || !user) {
      throw new Error("User not found.");
    }
    
    return { user };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const resendEmailVerificationOTP = async (identifier: string) => {
  try {
    const column = isEmail(identifier) ? 'email' : 'phone_number';
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, phone_number, is_verified, verification_expires')
      .eq(column, identifier)
      .limit(1);
    
    if (error || !users || users.length === 0) {
      throw new Error("User not found with this contact information.");
    }

    const user = users[0];
    
    if (user.is_verified) {
      throw new Error("Account is already verified.");
    }
    
    if (user.verification_expires && new Date() < new Date(user.verification_expires)) {
      const timeLeft = Math.ceil((new Date(user.verification_expires).getTime() - Date.now()) / (1000 * 60));
      throw new Error(`Please wait ${timeLeft} minutes before requesting a new OTP.`);
    }
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_code: verificationCode,
        verification_expires: verificationExpires.toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error("Error updating verification code.");
    }
    
    // Send via email or SMS
    if (user.email && isEmail(identifier)) {
      await sendVerificationEmail(user.email, verificationCode);
    } else if (user.phone_number) {
      console.log(`SMS verification code for ${user.phone_number}: ${verificationCode}`);
    }
    
    return {
      success: true,
      message: "Verification OTP has been resent to your registered contact method."
    };
  } catch (error) {
    console.error("Error resending verification OTP:", error);
    throw error;
  }
};

export const resendPasswordResetOTP = async (identifier: string) => {
  try {
    const column = isEmail(identifier) ? 'email' : 'phone_number';
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, phone_number, is_verified, is_deactivated, reset_token_expires')
      .eq(column, identifier)
      .limit(1);
    
    if (error || !users || users.length === 0) {
      throw new Error("User not found with this contact information.");
    }

    const user = users[0];
    
    if (!user.is_verified) {
      throw new Error("Please verify your account first before resetting password.");
    }
    
    if (user.is_deactivated) {
      throw new Error("Account is deactivated. Please contact support.");
    }
    
    if (user.reset_token_expires && new Date() < new Date(user.reset_token_expires)) {
      const timeLeft = Math.ceil((new Date(user.reset_token_expires).getTime() - Date.now()) / (1000 * 60));
      throw new Error(`Please wait ${timeLeft} minutes before requesting a new OTP.`);
    }
    
    const otp = generateOTP();
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: otp,
        reset_token_expires: resetTokenExpires.toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error("Error updating reset token.");
    }
    
    if (user.email && isEmail(identifier)) {
      await sendOTP(user.email, otp);
    } else if (user.phone_number) {
      console.log(`SMS reset code for ${user.phone_number}: ${otp}`);
    }
    
    return {
      success: true,
      message: "Password reset OTP has been resent to your registered contact method."
    };
  } catch (error) {
    console.error("Error resending password reset OTP:", error);
    throw error;
  }
};