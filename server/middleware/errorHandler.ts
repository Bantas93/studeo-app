import { NextFunction, Request, Response } from "express";

type ErrorPayload = {
  message: string;
  status?: number;
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let status = 500;
  let message = "Internal Server Error";

  if (err && typeof err === "object" && "message" in err) {
    const error = err as ErrorPayload;

    switch (error.status) {
      case 400:
        status = 400;
        break;
      case 401:
        status = 401;
        break;
      case 403:
        status = 403;
        break;
      case 404:
        status = 404;
        break;
      case 409:
        status = 409;
        break;
      default:
        status = 500;
        break;
    }

    message = error.message;
  }

  res.status(status).json({
    success: false,
    message,
  });
};
