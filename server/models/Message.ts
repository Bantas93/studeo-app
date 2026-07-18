import {
    Model,
    IMongoloquentSchema,
    IMongoloquentTimestamps,
} from "mongoloquent";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";

export interface IMessage
    extends IMongoloquentSchema,
    IMongoloquentTimestamps {
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

const messageCreateSchema = z.object({
    roomId: z.string().trim().min(1, "roomId tidak boleh kosong"),
    userId: z.string().trim().min(1, "userId tidak boleh kosong"),
    content: z.string().trim().min(1, "Pesan tidak boleh kosong"),
});

class Message extends Model<IMessage> {
    public static $schema: IMessage;
    protected $collection: string = "messages";

    static async sendMessage(payload: MessageInput) {
        const result = messageCreateSchema.safeParse(payload);

        if (!result.success) {
            const message = result.error.issues[0]?.message || "Validasi gagal";
            throw new AppError(message, 400);
        }

        return Message.create(result.data);
    }

    static async getMessagesByRoom(roomId: string) {
        return Message.where("roomId", roomId).orderBy("createdAt", "asc").get();
    }
}

export default Message;