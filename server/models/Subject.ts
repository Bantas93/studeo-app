import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import { AppError } from "../middleware/errorHandler";

export interface ISubject extends IMongoloquentSchema, IMongoloquentTimestamps {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SubjectInput = { name: string };
export type SubjectUpdateInput = Partial<SubjectInput>;

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

  static async createSubject(name: string) {
    if (!name || !name.trim()) {
      throw new AppError("Nama subject tidak boleh kosong", 400);
    }

    const normalizedName = name.trim().toLowerCase();

    const existingSubject = await Subject.where("name", normalizedName).first();
    if (existingSubject) {
      throw new AppError("Subject sudah ada", 400);
    }

    return Subject.create({ name: normalizedName });
  }

  static async updateSubject(id: string, payload: SubjectUpdateInput) {
    if (payload.name !== undefined && (!payload.name || !payload.name.trim())) {
      throw new AppError("Nama subject tidak boleh kosong", 400);
    }

    await Subject.getSubjectById(id);
    return Subject.where("_id", id).update(payload);
  }

  static async deleteSubject(id: string) {
    await Subject.getSubjectById(id);
    return Subject.where("_id", id).delete();
  }
}
export default Subject;
