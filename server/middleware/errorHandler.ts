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

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message || "Validasi gagal";
    res.status(400).json({ success: false, message });
    return;
  }

  if (err && typeof err === "object" && "message" in err) {
    const error = err as { message: string; status?: number };
    res
      .status(error.status ?? 500)
      .json({ success: false, message: error.message });
    return;
  }

  res.status(500).json({ success: false, message: "Internal Server Error" });
};
