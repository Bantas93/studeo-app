import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

interface NamedError extends Error {
  name: string;
  message: string;
  statusCode?: number;
  status?: number;
  errors?: { message: string }[];
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!err || typeof err !== "object") {
    res.status(500).json({ success: false, message: "Internal Server Error" });
    return;
  }

  const error = err as NamedError;

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message || "Validasi gagal";
    res.status(400).json({ success: false, message });
    return;
  }

  switch (error.name) {
    case "AppError": {
      const statusCode = error.statusCode ?? 500;
      res.status(statusCode).json({ success: false, message: error.message });
      break;
    }

    case "JsonWebTokenError": {
      res.status(401).json({ success: false, message: "Invalid Token" });
      break;
    }

    case "BadRequest": {
      res.status(400).json({ success: false, message: error.message });
      break;
    }

    case "Unauthorized": {
      res.status(401).json({ success: false, message: error.message });
      break;
    }

    case "Forbidden": {
      res.status(403).json({ success: false, message: error.message });
      break;
    }

    case "NotFound": {
      res.status(404).json({ success: false, message: error.message });
      break;
    }

    default: {
      const statusCode = error.statusCode ?? error.status ?? 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
      break;
    }
  }
};
