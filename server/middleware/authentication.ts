import { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler";
import { verifyToken } from "../helpers/jwt";
import User from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
      };
    }
  }
}

export async function authentication(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AppError("Invalid Token", 401);
    }

    const [tokenType, token] = authorization.split(" ");

    if (tokenType !== "Bearer" || !token) {
      throw new AppError("Invalid Token", 401);
    }

    const payload = verifyToken(token) as { _id: string; username: string };

    const user = await User.find(payload._id);

    if (!user) {
      throw new AppError("Invalid Token", 401);
    }

    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };
    next();
  } catch (error) {
    next(error);
  }
}
