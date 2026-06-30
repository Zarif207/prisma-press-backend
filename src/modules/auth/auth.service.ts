import { ILoginUSer } from "./auth.interface";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const loginUser = async (payload: ILoginUSer) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("password is incorrect");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, "accessSecret", { expiresIn: "1d" });
  const refreshToken = jwt.sign(jwtPayload, "refreshSecret", {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const authService = {
  loginUser,
};
