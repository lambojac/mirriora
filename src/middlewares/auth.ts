import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { supabase } from "../../src/config/dbConn";

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, token missing or invalid");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.id) 
      .single();

    if (userError || !userRecord) {
      res.status(401);
      throw new Error("User not found in database");
    }

    req.user = userRecord;
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, invalid or expired token");
  }
});

export default protect;
