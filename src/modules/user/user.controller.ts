import httpStatus from "http-Status";
import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";

// const catchAsync = (fn: Function) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await fn(req, res, next);
//     } catch (error) {
//       console.log(error);
//       res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         status: httpStatus.INTERNAL_SERVER_ERROR,
//         message: "Something went wrong",
//         error: error instanceof Error ? error.message : error,
//       });
//     }
//   };
// };

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await userService.registerUserIntoDB(payload);

    res.status(httpStatus.CREATED).json({
      success: true,
      status: httpStatus.CREATED,
      message: "User registered successfully",
      data: { user },
    });
  },
);

// const registerUser = async (req: Request, res: Response) => {
//   try {
//     const payload = req.body;
//     const user = await userService.registerUserIntoDB(payload);

//     res.status(httpStatus.CREATED).json({
//       success: true,
//       status: httpStatus.CREATED,
//       message: "User registered successfully",
//       data: { user },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       status: httpStatus.INTERNAL_SERVER_ERROR,
//       message: "Something went wrong",
//       error: error instanceof Error ? error.message : error,
//     });
//   }
// };


export const userController = {
  registerUser,
};

