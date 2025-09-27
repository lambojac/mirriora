import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",  
  port: 587,               
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    text: `Your OTP for email verification is: ${code}. It expires in 10 minutes.`,
  });
};



export const changePasswordEmail = async (email: string, code: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Change Password",
    text: `Your OTP for password change is: ${code}. It expires in 10 minutes.`,
  });
}


// import { Resend } from "resend";
// import dotenv from "dotenv";

// dotenv.config();

// const resend = new Resend(process.env.RESEND_API_KEY!);

// export const sendVerificationEmail = async (email: string, code: string) => {
//   try {
//     await resend.emails.send({
//       from: process.env.FROM_EMAIL!, 
//       to: email,
//       subject: "Verify Your Email",
//       text: `Your OTP for email verification is: ${code}. It expires in 10 minutes.`,
//     });
//     console.log(`Verification email sent to ${email}`);
//   } catch (error) {
//     console.error("Error sending verification email:", error);
//   }
// };

// export const changePasswordEmail = async (email: string, code: string) => {
//   try {
//     await resend.emails.send({
//       from: process.env.FROM_EMAIL!,
//       to: email,
//       subject: "Change Password",
//       text: `Your OTP for password change is: ${code}. It expires in 10 minutes.`,
//     });
//     console.log(`Change password email sent to ${email}`);
//   } catch (error) {
//     console.error("Error sending password change email:", error);
//   }
// };
