import { ZodSchema } from "zod";
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../helper/HttpStatusCode";

// middleware for validation
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { success, error } = schema.safeParse(req.body);
    if (!success) {
      res.status(HttpStatusCode.BadRequest).json({
        statusCode: HttpStatusCode.BadRequest,
        response: error,
        message: "invalid data",
      });
      return;
    }

    return next();
  };
};
