import {IMongoloquentSchema, IMongoloquentTimestamps, Model,} from "mongoloquent";
import {z} from "zod";
import {AppError} from "../middleware/errorHandler";

export interface IMember extends IMongoloquentSchema, IMongoloquentTimestamps {
  roomId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MemberInput = {
  roomId: string;
  userId: string;
};

const memberCreateSchema = z.object({
  roomId: z.string().trim().min(1, "Room ID wajib diisi"),
  userId: z.string().trim().min(1, "User ID wajib diisi"),
});

class Member extends Model<IMember> {
  public static $schema: IMember;
  protected $collection: string = "members";

  static async getMembersByRoomId(roomId: string) {
    return await Member.where("roomId", "eq", roomId)
      .all();
  }

  static async createMember(payload: MemberInput) {
    const result = memberCreateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    // Check if member already exists in this room
    const existing = await Member.where("roomId", "eq", payload.roomId)
      .where("userId", "eq", payload.userId)
      .first();

    if (existing) {
      throw new Error("Member already exists in this room");
    }

    await Member.create(payload);
  }
}
export default Member;
