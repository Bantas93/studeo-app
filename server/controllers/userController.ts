import { NextFunction, Request, Response } from "express";
import User from "../models/User";

class UserController {
  static async getUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await User.all();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
