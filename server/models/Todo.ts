import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";
import { ObjectId } from "mongodb";

export interface ITodo extends IMongoloquentSchema, IMongoloquentTimestamps {
  _id: ObjectId;
  roomId: string;
  userId: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TodoInput = {
  roomId: string;
  userId: string;
  title: string;
  description: string;
};

export type TodoUpdateInput = Partial<TodoInput>;

const todoCreateSchema = z.object({
  title: z.string().trim().min(1, "Title tidak boleh kosong"),
  description: z.string().trim().min(1, "Deskripsi tidak boleh kosong"),
});
const todoUpdateSchema = todoCreateSchema.partial();

class Todo extends Model<ITodo> {
  public static $schema: ITodo;
  protected $collection: string = "todos";

  static async getTodos() {
    return Todo.all();
  }

  static async getTodoById(id: string) {
    const data = await Todo.find(id);
    if (!data) throw new AppError("Todo tidak ditemukan", 404);

    const todo = {
      id: data._id,
      title: data.title,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return todo;
  }

  static async getTodoByIdRoom(id: string) {
    const data: ITodo[] = await Todo.where("roomId", id).get();
    if (!data || data.length === 0) {
      return [];
    }

    return data;
  }

  static async createTodo(payload: TodoInput) {
    const result = todoCreateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }
    return Todo.create(payload);
  }

  static async updateTodo(id: string, payload: TodoUpdateInput) {
    const result = todoUpdateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    await Todo.getTodoById(id);
    return Todo.where("_id", id).update(payload);
  }

  static async deleteTodo(id: string) {
    await Todo.getTodoById(id);
    return Todo.where("_id", id).delete();
  }
}
export default Todo;
