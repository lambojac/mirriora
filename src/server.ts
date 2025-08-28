import express, { Request, Response } from 'express';
import auth from "./modules/auth/auth.route";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import authRouter from "./modules/auth/auth.route";
import helmet from 'helmet';
import cors from "cors"
import rateLimit from 'express-rate-limit'; 
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import connectDB from './config/dbConn';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "API is running." });
});

const server = http.createServer(app);

app.use("/api/auth", authRouter);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
      console.log(
        `Socket.IO support namespace available at ws://localhost:${PORT}/support`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
