import { Request, Response, NextFunction } from 'express';
import User from "../modules/schemas/user";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import {DecodedToken} from "../modules/types/auth"



export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Not authorized, token missing or invalid");
    }
    
    
    const token = authHeader.split(" ")[1];
    
    const verified = jwt.verify(token, process.env.JWT_SECRET as string, { 
      algorithms: ["HS256"] 
    }) as DecodedToken;
    
    const user = await User.findById(verified.id).select("-password");
    
    if (!user) {
      res.status(401);
  
      throw new Error("User not found");
    }

    
    req.user = user;
    next();
  } catch (error) {
   
    res.status(401);
    throw new Error("Not authorized, please login");
  }
});

export default protect;