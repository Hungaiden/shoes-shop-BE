import jwt from "jsonwebtoken";
import { Request } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const getTokenFromCookie = (req: Request): string => {
  const token = req.cookies.token;
  if (!token) {
    throw new Error("No token found in cookies");
  }
  return token;
};
