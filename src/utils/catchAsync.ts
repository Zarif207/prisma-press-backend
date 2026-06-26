import { NextFunction, Request, Response, RequestHandler } from "express";
import httpStatus from "http-Status";

export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log(error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Something went wrong",
        error: error instanceof Error ? error.message : error,
      });
    }
  };
};
