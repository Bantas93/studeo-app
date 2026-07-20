import { NextFunction, Request, Response } from "express";
import Schedule from "../models/Schedule";

interface IParams {
  id: string;
}

interface IRoomParams {
  roomId: string;
}

class ScheduleController {
  static async getSchedules(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await Schedule.getSchedules();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getSchedulesByRoomId(
    req: Request<IRoomParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await Schedule.getSchedulesByRoomId(req.params.roomId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getScheduleById(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await Schedule.getScheduleById(req.params.id);
      res
        .status(data ? 200 : 404)
        .json(data ?? { message: "Schedule not found" });
    } catch (error) {
      next(error);
    }
  }

  static async createSchedule(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await Schedule.createSchedule(req.body);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async updateSchedule(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await Schedule.updateSchedule(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSchedule(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await Schedule.deleteSchedule(req.params.id);
      res
        .status(200)
        .json({ message: "Schedule has been deleted succesfully" });
    } catch (error) {
      next(error);
    }
  }
}
export default ScheduleController;
