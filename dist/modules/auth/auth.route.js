"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.post('/register', auth_controller_1.registerUser);
router.post('/login', auth_controller_1.loginUser);
router.get("/logout", auth_controller_1.logOut);
router.post("/verify-otp", auth_controller_1.verifyOTP);
router.post("/request-password-reset", auth_controller_1.requestPasswordReset);
router.post("/verify-reset-otp", auth_controller_1.verifyResetOTP);
router.post("/reset-password", auth_controller_1.resetPassword);
router.get('/profile', auth_1.default, auth_controller_1.getUserProfile);
router.post('/resend-verification-otp', auth_controller_1.resendVerificationOTP);
router.post('/resend-password-reset-otp', auth_controller_1.resendPasswordResetOTP);
exports.default = router;
//# sourceMappingURL=auth.route.js.map