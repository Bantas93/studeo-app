import { NextFunction, Request, Response } from "express";
import Room from "../models/Room";

interface IRoom {
  name: string;
  roomType: string;
  maxParticipants: number;
  subject: string;
  createdBy: string;
}
interface IParams {
  id: string;
}

class RoomController {
  static async getRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const rooms = await Room.getAllRooms();
      res.status(200).json(rooms);
    } catch (error) {
      next(error);
    }
  }

  static async getRoomById(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const room = await Room.getRoomById(req.params.id);
      res.status(room ? 200 : 404).json(room ?? { message: "Room not found" });
    } catch (error) {
      next(error);
    }
  }

  static async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, roomType, maxParticipants, selectedSubject } = req.body;
      const payload: IRoom = {
        name,
        roomType,
        maxParticipants,
        subject: selectedSubject,
        createdBy: String(req.user!.id),
      };

      const room = await Room.createRoom(payload);
      res.status(201).json(room);
    } catch (error) {
      next(error);
    }
  }

  static async updateRoom(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await Room.updateRoom(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteRoom(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await Room.deleteRoom(req.params.id);
      res.status(200).json({ message: "Room has been deleted succesfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default RoomController;
