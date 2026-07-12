import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    // 1. get token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.split(" ")[1];

    if (!token) {
      throw new Error("You are not logged in. Please log in to access this resource.");
    }

    // 2. verify token — verifyToken returns JwtPayload directly
    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret) as JwtPayload;

    if (!verifiedToken) {
      throw new Error("Invalid token. Please log in again.");
    }

    // 3. destructure directly from verifiedToken
    const { email, name, id, role } = verifiedToken;

    // 4. check role
    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new Error("Forbidden. You don't have permission to access this resource.");
    }

    // 5. check user exists in DB — only use unique fields
    const user = await prisma.user.findUnique({
      where: { id },  // ← only id needed
    });

    if (!user) {
      throw new Error("User not found. Please log in again.");
    }

    // 6. check if blocked
    if (user.activeStatus === "BLOCKED") {
      throw new Error("Your account has been blocked. Please contact support.");
    }

    // 7. attach user to request
    req.user = { email, name, id, role };

    next();
  });
};