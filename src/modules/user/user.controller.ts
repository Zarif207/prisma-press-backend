import httpStatus from "http-Status";
import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import jwt from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await userService.registerUserIntoDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully",
      data: { user },
    });
  },
);

const getMyProfile = catchAsync(
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { accessToken } = req.cookies;
    console.log(accessToken);

    const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret);

    if (!verifiedToken || typeof verifiedToken === "string") {
      throw new Error("Invalid access token");
    }

    const profile = await userService.getMyProfileFromDB(verifiedToken.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile fetched successfully",
      data: { profile },
    });
  }),
);

export const userController = {
  registerUser,
  getMyProfile,
};
