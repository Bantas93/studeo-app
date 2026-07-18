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

  private static validatePayload(payload: unknown, isCreate: boolean) {
    const schema = isCreate ? subjectCreateSchema : subjectUpdateSchema;
    const result = schema.safeParse(payload);
    if (!result.success)
      throw new AppError(
        result.error.issues[0]?.message || "Validasi gagal",
        400,
      );
    return result.data;
  }

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
    const valid = Subject.validatePayload(payload, true) as SubjectInput;
    return Subject.create(valid);
  }

  static async updateSubject(id: string, payload: SubjectUpdateInput) {
    const valid = Subject.validatePayload(payload, false) as SubjectUpdateInput;
    await Subject.getSubjectById(id);
    return Subject.where("_id", id).update(valid);
  }

  static async deleteSubject(id: string) {
    const data = await Subject.getSubjectById(id);
    if (!data) {
      throw new AppError("Subject tidak ditemukan", 404);
    }
    return Subject.where("_id", id).delete();
  }
}
export default Subject;
