import { NextFunction, Request, Response } from "express";
import Todo from "../models/Todo";

interface IParams {
  id: string;
}

class TodoController {
  static async getTodos(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await Todo.getTodos();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getTodoById(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await Todo.getTodoById(req.params.id);
      res.status(data ? 200 : 404).json(data ?? { message: "Todo not found" });
    } catch (error) {
      next(error);
    }
  }

  static async createTodo(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await Todo.createTodo(req.body);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async updateTodo(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await Todo.updateTodo(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteTodo(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await Todo.deleteTodo(req.params.id);
      res.status(200).json({ message: "Todo has been deleted succesfully" });
    } catch (error) {
      next(error);
    }
  }
}
export default TodoController;
