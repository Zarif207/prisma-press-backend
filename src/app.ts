import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { prisma } from "./lib/prisma";
import { userRouter } from "./modules/user/user.route";
import { authRouter } from "./modules/auth/auth.route";
import { postRoutes } from "./modules/post/post.route";

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

// app.post();

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRoutes)
// app.use("/api/comments", commentRoutes)


export default app;
