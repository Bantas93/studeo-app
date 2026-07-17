import { Request, Response, NextFunction } from "express";
import User from "../models/User";

class AuthController {
  static async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { username, email, password, avatarUrl, isOnline } = req.body;
      const newUser = await User.create({
        username,
        email,
        password,
        avatarUrl,
        isOnline,
      });
      res.status(201).json({
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
