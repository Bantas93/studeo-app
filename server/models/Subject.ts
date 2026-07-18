import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";

export interface ISubject extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SubjectInput = { name: string };
export type SubjectUpdateInput = Partial<SubjectInput>;

const subjectCreateSchema = z.object({
  name: z.string().trim().min(1, "Nama subject tidak boleh kosong"),
});
const subjectUpdateSchema = subjectCreateSchema.partial();

class Subject extends Model<ISubject> {
  public static $schema: ISubject;
  protected $collection: string = "subjects";

  static async getSubjects() {
    return Subject.all();
  }

  static async getSubjectById(id: string) {
    const data = await Subject.find(id);
    if (!data) throw new AppError("Subject tidak ditemukan", 404);

    const subject = {
      id: data.id || data._id,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return subject;
  }

  static async createSubject(payload: SubjectInput) {
    const result = subjectCreateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    return Subject.create(result.data);
  }

  static async updateSubject(id: string, payload: SubjectUpdateInput) {
    const result = subjectUpdateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    await Subject.getSubjectById(id);
    return Subject.where("_id", id).update(result.data);
  }

  static async deleteSubject(id: string) {
    await Subject.getSubjectById(id);
    return Subject.where("_id", id).delete();
  }
}
export default Subject;
