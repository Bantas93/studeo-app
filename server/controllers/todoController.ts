import { NextFunction, Request, Response } from "express";
import Todo, { ITodo, TodoInput } from "../models/Todo";
import { ObjectId } from "mongodb";

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

  static async getTodoByIdRoom(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await Todo.getTodoByIdRoom(req.params.id);
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
      const { roomId, title, description } = req.body;

      const payload: TodoInput = {
        roomId,
        userId: String(req.user!.id),
        title,
        description,
      };

      const data = await Todo.createTodo(payload);
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
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      await Todo.deleteTodo(id);
      res.status(200).json({ message: "Todo has been deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
export default TodoController;
