import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { prisma } from "./lib/prisma";
import httpStatus from "http-Status";
import bcrypt from "bcryptjs";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", async (req: Request, res: Response) => {
  const user = await prisma.user.findMany();
  console.log(user);
  res.send("Hello, World!");
});

app.post("/api/users/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, profilePhoto } = req.body;

    const isUserExist = await prisma.user.findUnique({ where: { email } });
    if (isUserExist) {
      return res.status(httpStatus.CONFLICT).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds),
    );

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await prisma.profile.create({
      data: {
        userId: createdUser.id,
        profilePhoto,
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        id: createdUser.id,
        email: createdUser.email,
      },
      omit: {
        password: true,
      },
      include: {
        profile: true,
      },
    });

    res.status(httpStatus.CREATED).json({
      success: true,
      status: httpStatus.CREATED,
      message: "User registered successfully",
      data: { user },
    });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
});

export default app;
