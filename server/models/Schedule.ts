import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";

export interface ISchedule
  extends IMongoloquentSchema, IMongoloquentTimestamps {
  title: string;
  meetingTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ScheduleInput = {
  title: string;
  meetingTime: Date;
};

export type ScheduleUpdateInput = Partial<ScheduleInput>;

const scheduleCreateSchema = z.object({
  title: z.string().trim().min(1, "Judul jadwal tidak boleh kosong"),
  meetingTime: z
    .string()
    .datetime({ message: "Format meetingTime harus ISO Date String" })
    .pipe(z.coerce.date()),
});

const scheduleUpdateSchema = z.object({
  title: z.string().trim().min(1, "Judul jadwal tidak boleh kosong").optional(),
  meetingTime: z
    .string()
    .datetime({ message: "Format meetingTime harus ISO Date String" })
    .pipe(z.coerce.date())
    .optional(),
});

class Schedule extends Model<ISchedule> {
  public static $schema: ISchedule;
  protected $collection: string = "schedules";

  private static validatePayload(payload: unknown, isCreate: boolean) {
    const schema = isCreate ? scheduleCreateSchema : scheduleUpdateSchema;
    const result = schema.safeParse(payload);

    if (!result.success) {
      throw new AppError(
        result.error.issues[0]?.message || "Validasi gagal",
        400,
      );
    }
    return result.data;
  }

  static async getSchedules() {
    return Schedule.all();
  }

  static async getScheduleById(id: string) {
    const data = await Schedule.find(id);
    if (!data) throw new AppError("Jadwal tidak ditemukan", 404);

    const schedule = {
      id: data.id || data._id,
      title: data.title,
      meetingTime: data.meetingTime,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return schedule;
  }

  static async createSchedule(payload: any) {
    const data = Schedule.validatePayload(payload, true) as ScheduleInput;
    return Schedule.create(data);
  }

  static async updateSchedule(id: string, payload: any) {
    const valid = Schedule.validatePayload(
      payload,
      false,
    ) as ScheduleUpdateInput;
    await Schedule.getScheduleById(id);
    return Schedule.where("_id", id).update(valid);
  }

  static async deleteSchedule(id: string) {
    const data = await Schedule.getScheduleById(id);
    if (!data) {
      throw new AppError("Jadwal tidak ditemukan", 404);
    }
    return Schedule.where("_id", id).delete();
  }
}

export default Schedule;
