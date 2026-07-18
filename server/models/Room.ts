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
  name: z.string().trim().min(1, "Name tidak boleh kosong"),
  roomType: z.string().trim().min(1, "Room Type tidak boleh kosong"),
  maxParticipants: z.number().int().min(1, "Maksimal partisipan minimal 1"),
  createdBy: z.string(),
});

const roomUpdateSchema = roomCreateSchema.partial();

class Room extends Model<IRoom> {
  public static $schema: IRoom;
  protected $collection: string = "rooms";

  private static validatePayload(payload: unknown, isCreate: boolean) {
    const schema = isCreate ? roomCreateSchema : roomUpdateSchema;
    const result = schema.safeParse(payload);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    return result.data;
  }

  private static async checkDuplicate(payload: RoomInput) {
    const name = payload.name.trim().toLowerCase();

    const existingRoom = await Room.where("name", name).first();
    if (existingRoom) {
      throw new AppError("Nama room sudah digunakan", 400);
    }
  }

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
    const validPayload = Room.validatePayload(payload, true) as RoomInput;
    await Room.checkDuplicate(validPayload);

    const checkRoom = await Room.create(validPayload);
    return checkRoom;
  }

  static async updateRoom(id: string, payload: RoomUpdateInput) {
    const validPayload = Room.validatePayload(
      payload,
      false,
    ) as RoomUpdateInput;
    return Room.where("_id", id).update(validPayload);
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
