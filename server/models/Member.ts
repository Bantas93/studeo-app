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

// todo may not needed
export type MemberUpdateInput = Partial<MemberInput>;

const memberCreateSchema = z.object({
  roomId: z.string().trim().min(1, "Room ID wajib diisi"),
  userId: z.string().trim().min(1, "User ID wajib diisi"),
});

// todo may not needed
const memberUpdateSchema = memberCreateSchema.partial();

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

    await Member.create(payload);
    return this.getMembersByRoomId(payload.roomId);
  }

  // todo let see if needed
  // static async getMembers() {
  //   return Member.all();
  // }

  // static async updateMember(id: string, payload: MemberUpdateInput) {
  //   const result = memberUpdateSchema.safeParse(payload);
  //   if (!result.success) {
  //     const message = result.error.issues[0]?.message || "Validasi gagal";
  //     throw new AppError(message, 400);
  //   }
  //
  //   await Member.getMembersByRoomId(id);
  //   return Member.where("_id", id).update(result.data);
  // }
  //
  // static async deleteMember(id: string) {
  //   await Member.getMembersByRoomId(id);
  //   return Member.where("_id", id).delete();
  // }
}
export default Member;
