import { ILoginUSer } from "./auth.interface";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";

const loginUser = async (payload: ILoginUSer) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("password is incorrect");
  }

  return user;
};

export const authService = {
  loginUser,
};
