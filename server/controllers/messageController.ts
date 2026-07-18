import { NextFunction, Request, Response } from "express";
import Message from "../models/Message";
import User from "../models/User";

interface IParams {
    roomId: string;
}

class MessageController {
    static async getMessagesByRoom(
        req: Request<IParams>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const messages = await Message.getMessagesByRoom(req.params.roomId);

            const userIds = [...new Set(messages.map((message) => message.userId))];
            const users = userIds.length ? await User.whereIn("_id", userIds).get() : [];
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