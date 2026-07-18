import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { server } from "../config/dns";
import { AppError } from "../middleware/errorHandler";
server();

interface IParams {
  id: string;
}
class UserController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = await User.getUserById(req.params.id);
      res.status(user ? 200 : 404).json(user ?? { message: "User not found" });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = await User.updateUser(req.params.id, req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await User.deleteUser(req.params.id);
      res.status(200).json({ deleted: result });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      if (!username) {
        throw new AppError("Username/password wajib diisi", 400);
      }
      if (!password) {
        throw new AppError("Username/password wajib diisi", 400);
      }
      const result = await User.login(req.body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
