import express from 'express';
import { loginUser, logOut, registerUser,verifyOTP,requestPasswordReset, resetPassword, verifyResetOTP, changePassword, requestChangePassword, setTransactionPin, requestChangeTransactionPin, changeTransactionPin, requestDeleteAccount, generateUserReferralCode, getReferralInfo, getUserProfile, resendVerificationOTP, resendPasswordResetOTP,createPIN, loginWithPIN, requestPINReset, verifyPINResetOTP, resetPIN, changePIN, checkPINStatus} from './auth.controller';

import protect from '../../middlewares/auth';


const router = express.Router();

  
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60b8c6f6b7f5b5d79c8d40f1"
 *         userName:
 *           type: string
 *           example: "john_doe"
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 *         accountType:
 *           type: string
 *           enum: [personal, business]
 *           example: "personal"
 *         isVerified:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-20T14:45:00Z"
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Error message"
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operation successful"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with username, email, password, and optional account type
 *     tags:
 *       - Authentication
 *     requestBody: 
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "john_doe"
 *                 description: Unique username for the user
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *                 description: User's password
 *               confirmPassword:
 *                 type: string
 *                 example: "password123"
 *                 description: Password confirmation (must match password)
 *               accountType:
 *                 type: string
 *                 enum: [personal, business]
 *                 example: "personal"
 *                 description: Type of account (optional, defaults to personal)
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "60b8c6f6b7f5b5d79c8d40f1"
 *                 userName:
 *                   type: string
 *                   example: "john_doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 accountType:
 *                   type: string
 *                   example: "personal"
 *                 token:
 *                   type: string
 *                   example: "jwt_token_here"
 *       400:
 *         description: Invalid input or account type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidAccountType:
 *                 value:
 *                   message: "Invalid account type. Must be either 'personal' or 'business'."
 *               validationError:
 *                 value:
 *                   message: "Invalid input data"
 *       409:
 *         description: User with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login an existing user
 *     description: Log in with an email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: User's password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "60b8c6f6b7f5b5d79c8d40f1"
 *                 userName:
 *                   type: string
 *                   example: "john_doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 token:
 *                   type: string
 *                   example: "jwt_token_here"
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout the user
 *     description: Logs the user out by clearing the authentication cookie
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You have successfully logged out."
 */
router.get("/logout", logOut);
/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify a user's email using a 6-digit OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email successfully verified.
 *         content:
 *           application/json:
 *             example:
 *               message: "Email verified successfully."
 *       400:
 *         description: Invalid OTP or expired OTP.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid or expired OTP."
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             example:
 *               error: "User not found."
 */
router.post("/verify-otp", verifyOTP);

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Request password reset by sending a 6-digit OTP to email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully.
 *       400:
 *         description: Invalid email.
*/
 

router.post("/request-password-reset", requestPasswordReset);
/**
 * @swagger
 * /api/auth/verify-reset-otp:
 *   post:
 *     summary: Verify password reset OTP
 *     description: Verify the 6-digit OTP sent for password reset
 *     tags:
 *       - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 example: "123456"
 *                 description: 6-digit OTP sent to email for password reset
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "user123"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingOTP:
 *                 value:
 *                   message: "OTP is required."
 *               invalidFormat:
 *                 value:
 *                   message: "OTP must be a 6-digit number."
 *               expiredOTP:
 *                 value:
 *                   message: "Invalid or expired OTP."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/verify-reset-otp", verifyResetOTP);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Reset user password after OTP verification
 *     tags:
 *       - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *               - userIdentifier
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *                 description: New password for the user
 *               confirmPassword:
 *                 type: string
 *                 example: "newpassword123"
 *                 description: Confirmation of new password (must match password)
 *               userIdentifier:
 *                 type: string
 *                 example: "user123"
 *                 description: User identifier obtained from OTP verification
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully."
 *       400:
 *         description: Invalid input or passwords don't match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingFields:
 *                 value:
 *                   message: "Both password and confirm password are required."
 *               missingIdentifier:
 *                 value:
 *                   message: "User identifier is required. Please verify OTP first."
 *               passwordMismatch:
 *                 value:
 *                   message: "Passwords do not match."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:  
 *               $ref: '#/components/schemas/Error'
 */
router.post("/reset-password", resetPassword);  

/**
 * @swagger
 * /api/auth/referral/generate:
 *   post:
 *     summary: Generate user referral code
 *     description: Generates a unique referral code for the authenticated user
 *     tags:
 *       - Referral
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     referralCode:
 *                       type: string
 *                       example: "REF123ABC456"
 *                     message:
 *                       type: string
 *                       example: "Referral code generated successfully"
 *       400:
 *         description: Bad request or referral code already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Referral code already exists for this user"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not authenticated."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */
router.post("/referral/generate", protect, generateUserReferralCode);

/**
 * @swagger
 * /api/auth/referral/info:
 *   get:
 *     summary: Get user referral information
 *     description: Retrieves referral information for the authenticated user including referral code and statistics
 *     tags:
 *       - Referral
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     referralCode:
 *                       type: string
 *                       example: "REF123ABC456"
 *                     totalReferrals:
 *                       type: number
 *                       example: 5
 *                     successfulReferrals:
 *                       type: number
 *                       example: 3
 *                     referralEarnings:
 *                       type: number
 *                       example: 150.00
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not authenticated."
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving referral information"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */
router.get("/referral/info", protect, getReferralInfo);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the authenticated user's profile information (excluding password)
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user123"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-20T14:45:00Z"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not authenticated."
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving user profile"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while fetching user profile."
 */
router.get('/profile', protect, getUserProfile);

/**
 * @swagger
 * /api/auth/resend-verification-otp:
 *   post:
 *     summary: Resend email verification OTP
 *     description: Resends the OTP for email verification to the specified email address
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: Email address to resend verification OTP to
 *     responses:
 *       200:
 *         description: Verification OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Verification OTP has been resent to your email."
 *       400:
 *         description: Bad request - missing email or other validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email is required."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while resending verification OTP."
 */
router.post('/resend-verification-otp', resendVerificationOTP);

/**
 * @swagger
 * /api/auth/resend-password-reset-otp:
 *   post:
 *     summary: Resend password reset OTP
 *     description: Resends the OTP for password reset to the specified email address
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: Email address to resend password reset OTP to
 *     responses:
 *       200:
 *         description: Password reset OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password reset OTP has been resent to your email."
 *       400:
 *         description: Bad request - missing email or other validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email is required."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while resending password reset OTP."
 */
router.post('/resend-password-reset-otp', resendPasswordResetOTP);
router.post("/create-pin", protect, createPIN);
router.post("/login-pin", loginWithPIN);
router.post("/request-pin-reset", requestPINReset);
router.post("/verify-pin-reset-otp", verifyPINResetOTP);
router.post("/reset-pin", resetPIN);
router.post("/change-pin", protect, changePIN);
router.get("/pin-status", protect, checkPINStatus);
router.post("/transaction-pin",protect,setTransactionPin)
export default router;

