import { NextFunction, Request, Response } from "express";
import Message from "../models/Message";
import User from "../models/User";

interface IParams {
  roomId: string;
}

class MessageController {
  static async sendMessage(
    req: Request<{}, {}, { roomId: string; content: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { roomId, content } = req.body;
      const userId = req.user!.id;

      const message = await Message.sendMessage({
        roomId,
        userId: String(userId),
        content,
      });

      res.status(201).json({
        ...message,
        username: req.user!.username,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMessagesByRoom(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const messages = await Message.getMessagesByRoom(req.params.roomId);

      const userIds = [...new Set(messages.map((message) => message.userId))];
      const users = userIds.length
        ? await User.whereIn("_id", userIds).get()
        : [];
      const usernameById = new Map(
        users.map((user) => [String(user._id), user.username]),
      );

      const withUsername = messages.map((message) => ({
        ...message,
        username: usernameById.get(String(message.userId)),
      }));

      res.status(200).json(withUsername);
    } catch (error) {
      next(error);
    }
  }
}

export default MessageController;
