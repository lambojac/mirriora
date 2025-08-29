"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.resendPasswordResetOTP = exports.resendVerificationOTP = exports.getUserProfile = exports.deleteAccount = exports.changePassword = exports.resetPassword = exports.verifyResetOTP = exports.requestPasswordReset = exports.verifyOTP = exports.logOut = exports.loginUser = exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userService = __importStar(require("./auth.service"));
const auth_service_1 = require("./auth.service");
const auth_service_2 = require("./auth.service");
exports.registerUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.register(req.body);
    res.status(result.status).json(Object.assign({}, result.data));
}));
exports.loginUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.login(req.body, res);
    res.status(result.status).json(result.data);
}));
exports.logOut = (0, express_async_handler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true,
    });
    res.status(200).json({ message: "You have successfully logged out." });
}));
exports.verifyOTP = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const message = yield (0, auth_service_1.verifyOTPService)(email, otp);
        res.status(200).json({ message });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400);
            throw new Error(error.message);
        }
        else {
            res.status(500);
            throw new Error("An unexpected error occurred.");
        }
    }
}));
exports.requestPasswordReset = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error("Email is required.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error("Please provide a valid email address.");
    }
    try {
        const result = yield (0, auth_service_2.handlePasswordResetRequest)(email);
        res.status(200).json({
            success: result.success,
            message: result.message
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400);
            throw new Error(error.message);
        }
        else {
            res.status(500);
            throw new Error("An unexpected error occurred while processing password reset request.");
        }
    }
}));
exports.verifyResetOTP = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    if (!otp) {
        res.status(400);
        throw new Error("OTP is required.");
    }
    if (!/^\d{6}$/.test(otp)) {
        res.status(400);
        throw new Error("OTP must be a 6-digit number.");
    }
    try {
        const result = yield (0, auth_service_2.handleOTPVerification)(otp);
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                userId: result.userId,
                email: result.email
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400);
            throw new Error(error.message);
        }
        else {
            res.status(500);
            throw new Error("An unexpected error occurred while verifying OTP.");
        }
    }
}));
exports.resetPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, confirmPassword, userIdentifier } = req.body;
    if (!password || !confirmPassword) {
        res.status(400);
        throw new Error("Both password and confirm password are required.");
    }
    if (!userIdentifier) {
        res.status(400);
        throw new Error("User identifier is required. Please verify OTP first.");
    }
    try {
        const result = yield (0, auth_service_2.handlePasswordReset)(password, confirmPassword, userIdentifier);
        res.status(200).json({
            success: result.success,
            message: result.message
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400);
            throw new Error(error.message);
        }
        else {
            res.status(500);
            throw new Error("An unexpected error occurred while resetting password.");
        }
    }
}));
exports.changePassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { password, confirmPassword } = req.body;
    const user = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!password || !confirmPassword) {
        res.status(400);
        throw new Error("Both new password and confirm new password are required.");
    }
    if (password !== confirmPassword) {
        res.status(400);
        throw new Error("New password and confirm new password do not match.");
    }
    yield userService.changeUserPassword(user, password, confirmPassword);
    res.status(200).json({ message: "Password changed successfully." });
}));
exports.deleteAccount = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401);
        throw new Error("User not authenticated.");
    }
    const { password } = req.body;
    if (!password) {
        res.status(400);
        throw new Error("Password is required to delete account.");
    }
    try {
        const result = yield userService.deleteUserPermanently(userId, password);
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
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400);
            throw new Error(error.message);
        }
        else {
            res.status(500);
            throw new Error("An unexpected error occurred while deleting account.");
        }
    }
}));
exports.getUserProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401);
        throw new Error("User not authenticated.");
    }
    try {
        const user = yield userService.getUserById(userId);
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400);
            throw new Error(error.message);
        }
        else {
            res.status(500);
            throw new Error("An unexpected error occurred while fetching user profile.");
        }
    }
}));
exports.resendVerificationOTP = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error("Email is required.");
    }
    try {
        yield userService.resendEmailVerificationOTP(email);
        res.status(200).json({
            success: true,
            message: "Verification OTP has been resent to your email."
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400);
            throw new Error(error.message);
        }
        else {
            res.status(500);
            throw new Error("An unexpected error occurred while resending verification OTP.");
        }
    }
}));
exports.resendPasswordResetOTP = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error("Email is required.");
    }
    try {
        yield userService.resendPasswordResetOTP(email);
        res.status(200).json({
            success: true,
            message: "Password reset OTP has been resent to your email."
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400);
            throw new Error(error.message);
        }
        else {
            res.status(500);
            throw new Error("An unexpected error occurred while resending password reset OTP.");
        }
    }
}));
//# sourceMappingURL=auth.controller.js.map