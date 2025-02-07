import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../helper/HttpStatusCode";
import { JwtPayload, verify } from "jsonwebtoken";
import { jwtSecret } from "../helper/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// middleware use for authenticate
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(HttpStatusCode.Unauthorized).json({
      statusCode: HttpStatusCode.Unauthorized,
      response: {},
      message: "Unauthorized",
    });
    return;
  }

  const token = authHeader.split(" ")?.[1];
  if (!token) {
    res.status(HttpStatusCode.Unauthorized).json({
      statusCode: HttpStatusCode.Unauthorized,
      response: {},
      message: "Unauthorized",
    });
    return;
  }

  try {
    const payload = verify(token, jwtSecret) as JwtPayload;
    if (!payload) {
      res.status(HttpStatusCode.Unauthorized).json({
        statusCode: HttpStatusCode.Unauthorized,
        response: {},
        message: "Unauthorized",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        user_id: payload.user_id,
      },
    });

    if (!user) {
      res.status(HttpStatusCode.Unauthorized).json({
        statusCode: HttpStatusCode.Unauthorized,
        response: {},
        message: "Unauthorized",
      });
      return;
    }

    req["user"] = user;
    return next();
  } catch (err) {
    res.status(HttpStatusCode.Unauthorized).json({
      statusCode: HttpStatusCode.Unauthorized,
      response: {},
      message: "Unauthorized",
    });
    return;
  }
};
