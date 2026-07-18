import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";

export interface IRoom extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  roomType: string;
  maxParticipants: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RoomInput = {
  name: string;
  roomType: string;
  maxParticipants: number;
  createdBy: string;
};

export type RoomUpdateInput = Partial<RoomInput>;

const roomCreateSchema = z.object({
  name: z.string().trim().min(1, "Topic tidak boleh kosong"),
  roomType: z.string().trim().min(1, "Type tidak boleh kosong"),
  maxParticipants: z.number().int().min(10, "Minimal partisipan 10"),
  createdBy: z.string().trim().min(1, "createdBy tidak boleh kosong"),
});

const roomUpdateSchema = roomCreateSchema.partial();

class Room extends Model<IRoom> {
  public static $schema: IRoom;
  protected $collection: string = "rooms";

  static async getAllRooms() {
    return Room.all();
  }

  static async getRoomById(id: string) {
    const findRoom = await Room.find(id);
    if (!findRoom) {
      throw new AppError("Room tidak ditemukan", 404);
    }

    const room = {
      id: findRoom.id || findRoom._id,
      name: findRoom.name,
      roomType: findRoom.roomType,
      maxParticipants: findRoom.maxParticipants,
      createdBy: findRoom.createdBy,
      createdAt: findRoom.createdAt,
      updatedAt: findRoom.updatedAt,
    };
    return room;
  }

  static async createRoom(payload: RoomInput) {
    const result = roomCreateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    const validPayload = result.data;

    const existingRoom = await Room.where(
      "name",
      validPayload.name.trim().toLowerCase(),
    ).first();
    if (existingRoom) {
      throw new AppError("Nama room sudah digunakan", 400);
    }

    const checkRoom = await Room.create(validPayload);
    return checkRoom;
  }

  static async updateRoom(id: string, payload: RoomUpdateInput) {
    const result = roomUpdateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    return Room.where("_id", id).update(result.data);
  }

  static async deleteRoom(id: string) {
    const findRoom = await Room.find(id);
    if (!findRoom) {
      throw new AppError("Room tidak ditemukan", 404);
    }
    return Room.where("_id", id).delete();
  }
}

export default Room;
