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
  description?: string;
  roomId: string;
  meetingTime: Date;
  isEmitted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ScheduleInput = {
  title: string;
  description?: string;
  roomId: string;
  meetingTime: Date;
  isEmitted?: boolean;
};

export type ScheduleUpdateInput = Partial<ScheduleInput>;

const scheduleCreateSchema = z.object({
  title: z.string().trim().min(1, "Judul jadwal tidak boleh kosong"),
  roomId: z.string().trim().min(1, "Room ID wajib diisi"),
  meetingTime: z
    .string()
    .datetime({ message: "Format meetingTime harus ISO Date String" })
    .pipe(z.coerce.date()),
});

const scheduleUpdateSchema = scheduleCreateSchema.partial();

class Schedule extends Model<ISchedule> {
  public static $schema: ISchedule;
  protected $collection: string = "schedules";

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

  static async createSchedule(payload: ScheduleInput) {
    const result = scheduleCreateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    return Schedule.create(result.data);
  }

  static async updateSchedule(id: string, payload: ScheduleUpdateInput) {
    const result = scheduleUpdateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    await Schedule.getScheduleById(id);
    return Schedule.where("_id", id).update(result.data);
  }

  static async update(schedule: ISchedule, payload: ScheduleUpdateInput) {
    const id = String(schedule._id);
    return Schedule.where("_id", id).update(payload);
  }

  static async deleteSchedule(id: string) {
    await Schedule.getScheduleById(id);
    return Schedule.where("_id", id).delete();
  }
}

export default Schedule;
