"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendPasswordResetOTP = exports.resendEmailVerificationOTP = exports.getUserById = exports.deleteUserPermanently = exports.changeUserPassword = exports.requestChangeUserPassword = exports.getUserProfileData = exports.handlePasswordReset = exports.handleOTPVerification = exports.handlePasswordResetRequest = exports.verifyOTPService = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../../modules/schemas/user"));
const tokenGen_1 = __importDefault(require("../../modules/utils/tokenGen"));
const emailService_1 = require("../../modules/utils/emailService");
const otpMailer_1 = require("../../modules/utils/otpMailer");
const register = (body) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, phoneNumber, email, password } = body;
    if (!fullName || !password) {
        return { status: 400, data: { message: "Please provide all required fields." } };
    }
    const existingUser = yield user_1.default.findOne({ email });
    if (existingUser) {
        return { status: 400, data: { message: "User with this email already exists." } };
    }
    const existingUserName = yield user_1.default.findOne({ fullName });
    if (existingUserName) {
        return { status: 400, data: { message: "User with this username already exists." } };
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    const user = yield user_1.default.create({
        email,
        password: hashedPassword,
        verificationCode,
        verificationExpires,
        isVerified: false,
    });
    yield (0, emailService_1.sendVerificationEmail)(email, verificationCode);
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
});
exports.register = register;
const login = (body, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, phoneNumber } = body;
    const user = yield user_1.default.findOne({ email }).select("+password");
    if (!user)
        return { status: 400, data: { message: "User not found." } };
    if (!user.isVerified)
        return { status: 400, data: { message: "Please verify your email." } };
    const isValid = yield bcryptjs_1.default.compare(password, user.password);
    if (!isValid)
        return { status: 400, data: { message: "Invalid credentials." } };
    const token = (0, tokenGen_1.default)(String(user._id));
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
});
exports.login = login;
const verifyOTPService = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email || !otp) {
        throw new Error("Email and OTP are required.");
    }
    const user = yield user_1.default.findOne({ email });
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
    yield user.save();
    return "Email verified successfully. You can now log in.";
});
exports.verifyOTPService = verifyOTPService;
const handlePasswordResetRequest = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({ email });
    if (!user) {
        throw new Error("User not found.");
    }
    if (!user.isVerified) {
        throw new Error("Please verify your email first before resetting password.");
    }
    if (user.isDeactivated) {
        throw new Error("Account is deactivated. Please contact support.");
    }
    const otp = (0, otpMailer_1.generateOTP)();
    user.resetToken = otp;
    user.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    yield user.save();
    yield (0, otpMailer_1.sendOTP)(email, otp);
    return {
        success: true,
        message: "OTP sent to your email."
    };
});
exports.handlePasswordResetRequest = handlePasswordResetRequest;
const handleOTPVerification = (otp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({ resetToken: otp });
    if (!user || (user.resetTokenExpires && new Date() > user.resetTokenExpires)) {
        throw new Error("Invalid or expired OTP.");
    }
    user.resetTokenVerified = true;
    yield user.save();
    return {
        userId: user._id,
        email: user.email,
        success: true,
        message: "OTP verified successfully. You can now reset your password."
    };
});
exports.handleOTPVerification = handleOTPVerification;
const handlePasswordReset = (password, confirmPassword, userIdentifier) => __awaiter(void 0, void 0, void 0, function* () {
    if (!password || !confirmPassword) {
        throw new Error("Both password and confirm password are required.");
    }
    if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
    }
    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
    }
    const user = yield user_1.default.findOne({
        $or: [
            { email: userIdentifier }
        ],
        resetToken: { $ne: null },
        resetTokenVerified: true
    });
    if (!user) {
        throw new Error("Invalid password reset session. Please restart the password reset process.");
    }
    if (user.resetTokenExpires && new Date() > user.resetTokenExpires) {
        throw new Error("Password reset session has expired. Please restart the process.");
    }
    const salt = yield bcryptjs_1.default.genSalt(10);
    user.password = yield bcryptjs_1.default.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    user.resetTokenVerified = undefined;
    yield user.save();
    return {
        success: true,
        message: "Password has been reset successfully."
    };
});
exports.handlePasswordReset = handlePasswordReset;
const getUserProfileData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield user_1.default.findById(user).select("-password -verificationCode -verificationExpires -resetToken -resetTokenExpires").lean();
    if (!userData) {
        throw new Error("User not found.");
    }
    return user;
});
exports.getUserProfileData = getUserProfileData;
const requestChangeUserPassword = (userId, currentPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findById(userId).select("+password");
    if (!user) {
        throw new Error("User not found.");
    }
    const isValid = yield bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isValid) {
        throw new Error("Invalid current password.");
    }
    const otp = (0, otpMailer_1.generateOTP)();
    user.otp = otp;
    yield user.save();
    yield (0, emailService_1.changePasswordEmail)(user.email, otp);
    return { message: "OTP sent to your email for password change."
    };
});
exports.requestChangeUserPassword = requestChangeUserPassword;
const changeUserPassword = (userId, newPassword, confirmPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findById(userId).select("+otp");
    if (!user) {
        throw new Error("User not found.");
    }
    if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match.");
    }
    const salt = yield bcryptjs_1.default.genSalt(10);
    user.password = yield bcryptjs_1.default.hash(newPassword, salt);
    yield user.save();
    return { message: "Password changed successfully."
    };
});
exports.changeUserPassword = changeUserPassword;
const deleteUserPermanently = (userId, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(userId).select("+password");
        if (!user) {
            throw new Error("User not found.");
        }
        if (user.isDeactivated) {
            throw new Error("Cannot delete deactivated account. Please reactivate first or contact support.");
        }
        const isValidPassword = yield bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid password. Account deletion cancelled.");
        }
        yield user_1.default.findByIdAndDelete(userId);
        return {
            success: true,
            message: "Account has been permanently deleted. All data has been removed."
        };
    }
    catch (error) {
        console.error("Error deleting user account:", error);
        throw error;
    }
});
exports.deleteUserPermanently = deleteUserPermanently;
const getUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(userId).select('-password -resetToken -resetTokenExpires -verificationCode -verificationExpires');
        if (!user) {
            throw new Error("User not found.");
        }
        return {
            user
        };
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
});
exports.getUserById = getUserById;
const resendEmailVerificationOTP = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            throw new Error("User not found with this email address.");
        }
        if (user.isVerified) {
            throw new Error("Email is already verified.");
        }
        if (user.verificationExpires && new Date() < new Date(user.verificationExpires)) {
            const timeLeft = Math.ceil((new Date(user.verificationExpires).getTime() - Date.now()) / (1000 * 60));
            throw new Error(`Please wait ${timeLeft} minutes before requesting a new OTP.`);
        }
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.verificationCode = verificationCode;
        user.verificationExpires = verificationExpires;
        yield user.save();
        yield (0, emailService_1.sendVerificationEmail)(email, verificationCode);
        return {
            success: true,
            message: "Verification OTP has been resent to your email."
        };
    }
    catch (error) {
        console.error("Error resending email verification OTP:", error);
        throw error;
    }
});
exports.resendEmailVerificationOTP = resendEmailVerificationOTP;
const resendPasswordResetOTP = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            throw new Error("User not found with this email address.");
        }
        if (!user.isVerified) {
            throw new Error("Please verify your email first before resetting password.");
        }
        if (user.isDeactivated) {
            throw new Error("Account is deactivated. Please contact support.");
        }
        if (user.resetTokenExpires && new Date() < new Date(user.resetTokenExpires)) {
            const timeLeft = Math.ceil((new Date(user.resetTokenExpires).getTime() - Date.now()) / (1000 * 60));
            throw new Error(`Please wait ${timeLeft} minutes before requesting a new OTP.`);
        }
        const otp = (0, otpMailer_1.generateOTP)();
        user.resetToken = otp;
        user.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
        yield user.save();
        yield (0, otpMailer_1.sendOTP)(email, otp);
        return {
            success: true,
            message: "Password reset OTP has been resent to your email."
        };
    }
    catch (error) {
        console.error("Error resending password reset OTP:", error);
        throw error;
    }
});
exports.resendPasswordResetOTP = resendPasswordResetOTP;
//# sourceMappingURL=auth.service.js.map