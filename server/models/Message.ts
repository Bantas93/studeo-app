import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import { AppError } from "../middleware/errorHandler";

export interface IMessage extends IMongoloquentSchema, IMongoloquentTimestamps {
  roomId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageInput = {
  roomId: string;
  userId: string;
  content: string;
};

class Message extends Model<IMessage> {
  public static $schema: IMessage;
  protected $collection: string = "messages";

  static async sendMessage(payload: MessageInput) {
    if (!payload.roomId || !payload.roomId.trim()) {
      throw new AppError("roomId tidak boleh kosong", 400);
    }
    if (!payload.userId || !payload.userId.trim()) {
      throw new AppError("userId tidak boleh kosong", 400);
    }
    if (!payload.content || !payload.content.trim()) {
      throw new AppError("Pesan tidak boleh kosong", 400);
    }

    return Message.create(payload);
  }

  static async getMessagesByRoom(roomId: string) {
    return Message.where("roomId", roomId).orderBy("createdAt", "asc").get();
  }
}

export default Message;
