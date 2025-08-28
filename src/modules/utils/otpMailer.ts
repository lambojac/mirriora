import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

/**
 * Generate a 6-digit OTP as a string.
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send the OTP to the specified email address.
 * 
 * @param email - Recipient email address
 * @param otp - One Time Password to be sent
 */
export const sendOTP = async (email: string, otp: string): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials are not set in environment variables.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP code is: ${otp}. It expires in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};
