import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import {
  loginSchema,
  LoginType,
  registerSchema,
  RegisterType,
} from "../helper/validationSchema";
import { validate } from "../middleware/validationMiddleware";
import { jwtSecret } from "../helper/config";
import { auth } from "../middleware/auth";

const userRoute = Router();
const prisma = new PrismaClient();

userRoute.post("/register", validate(registerSchema), async (req, res) => {
  const { name, phone_number, password }: RegisterType = req.body;

  const isExist = await prisma.user.findFirst({ where: { phone_number } });

  if (isExist) {
    res.status(400).json({ message: "user already exist" });
    return;
  }

  const user = await prisma.user.create({
    data: {
      name,
      phone_number,
      password,
    },
  });

  const { user_id } = user;
  const token = jwt.sign({ name, user_id }, jwtSecret);

  res.json({
    response: { ...user, token, password: undefined },
    message: "registration successfully",
  });
});

userRoute.post("/login", validate(loginSchema), async (req, res) => {
  const { phone_number, password }: LoginType = req.body;
  const user = await prisma.user.findUnique({
    where: {
      phone_number,
    },
  });

  if (!user) {
    res.status(404).json({
      message: "user not found",
    });
    return;
  }

  if (password !== user.password) {
    res.status(403).json({
      message: "wrong password",
    });
    return;
  }

  const { user_id, name } = user;
  const token = jwt.sign({ name, user_id }, jwtSecret);

  res.json({
    response: { ...user, token, password: undefined },
    message: "login successfully",
  });
});

userRoute.get("/profile", auth, async (req, res) => {
  if (!req.user) {
    res.status(403).json({
      message: "unauthorize user",
    });
    return;
  }

  const { user_id } = req.user;

  const user = await prisma.user.findUnique({
    where: {
      user_id,
    },
    omit: {
      password: true,
    },
  });

  if (!user) {
    res.status(404).json({
      message: "user not found",
    });
    return;
  }

  res.json({ response: user, message: "profile details" });
});

export default userRoute;
