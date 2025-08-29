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
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.set("strictQuery", false);
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbUrl = process.env.DB_URL;
        if (!dbUrl) {
            throw new Error("DB_URL is not defined in environment variables.");
        }
        const conn = yield mongoose_1.default.connect(dbUrl);
        console.log(`Database Running!!! ${conn.connection.host}`);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Database connection error:", err.message);
        }
        else {
            console.error("Unknown error occurred during DB connection.");
        }
    }
});
exports.default = connectDB;
//# sourceMappingURL=dbConn.js.map