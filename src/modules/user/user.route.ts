import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", userController.registerUser);

// with middleware
router.get(
  "/me",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("Middleware before getMyProfile");
    const { accessToken } = req.cookies;
    console.log(accessToken);

    const verifiedToken = jwtUtils.verifyToken(
      accessToken,
      config.jwt_access_secret,
    );

    const { id, name, email, role } = verifiedToken;

    // requiredRole = ["admin", "user", "author"];
    const requiredRole = [Role.ADMIN, Role.USER, Role.AUTHOR];

    if (!requiredRole.includes(role)) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: "Forbidden: You are not authorized to access this resource",
        });
    }

    if (requiredRole.length > 0 && !requiredRole.includes(role)) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: "Forbidden: You are not authorized to access this resource",
      });
    }

    if (!verifiedToken || typeof verifiedToken === "string") {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized: Invalid access token",
      });
    }
    next();
  },
  userController.getMyProfile,
);

export const userRouter = router;
