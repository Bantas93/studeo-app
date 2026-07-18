import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";

export interface IMember extends IMongoloquentSchema, IMongoloquentTimestamps {
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MemberInput = {
  role: string;
  status: string;
};
export type MemberUpdateInput = Partial<MemberInput>;

const memberCreateSchema = z.object({
  role: z.string().trim().min(1, "Role wajib diisi"),
  status: z.string().trim().min(1, "Status wajib diisi"),
});
const memberUpdateSchema = memberCreateSchema.partial();

class Member extends Model<IMember> {
  public static $schema: IMember;
  protected $collection: string = "members";

  static async getMembers() {
    return Member.all();
  }

  static async getMemberById(id: string) {
    const findMember = await Member.find(id);
    if (!findMember) throw new AppError("Member tidak ditemukan", 404);

    const member = {
      id: findMember.id || findMember._id,
      roomId: findMember.roomId,
      userId: findMember.userId,
      role: findMember.role,
      status: findMember.status,
      createdAt: findMember.createdAt,
      updatedAt: findMember.updatedAt,
    };

    return member;
  }

  static async createMember(payload: MemberInput) {
    const result = memberCreateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    return Member.create(result.data);
  }

  static async updateMember(id: string, payload: MemberUpdateInput) {
    const result = memberUpdateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    await Member.getMemberById(id);
    return Member.where("_id", id).update(result.data);
  }

  static async deleteMember(id: string) {
    await Member.getMemberById(id);
    return Member.where("_id", id).delete();
  }
}
export default Member;
