import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";

export interface ITodo extends IMongoloquentSchema, IMongoloquentTimestamps {
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TodoInput = { roomId: string; userId: string; description: string };
export type TodoUpdateInput = Partial<TodoInput>;

const todoCreateSchema = z.object({
  description: z.string().trim().min(1, "Deskripsi tidak boleh kosong"),
});
const todoUpdateSchema = todoCreateSchema.partial();

class Todo extends Model<ITodo> {
  public static $schema: ITodo;
  protected $collection: string = "todos";

  private static validatePayload(payload: unknown, isCreate: boolean) {
    const schema = isCreate ? todoCreateSchema : todoUpdateSchema;
    const result = schema.safeParse(payload);
    if (!result.success)
      throw new AppError(
        result.error.issues[0]?.message || "Validasi gagal",
        400,
      );
    return result.data;
  }

  static async getTodos() {
    return Todo.all();
  }

  static async getTodoById(id: string) {
    const data = await Todo.find(id);
    if (!data) throw new AppError("Todo tidak ditemukan", 404);

    const todo = {
      id: data.id || data._id,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return todo;
  }

  static async createTodo(payload: TodoInput) {
    const valid = Todo.validatePayload(payload, true) as TodoInput;
    return Todo.create(valid);
  }

  static async updateTodo(id: string, payload: TodoUpdateInput) {
    const valid = Todo.validatePayload(payload, false) as TodoUpdateInput;
    await Todo.getTodoById(id);
    return Todo.where("_id", id).update(valid);
  }

  static async deleteTodo(id: string) {
    const data = await Todo.getTodoById(id);
    if (!data) {
      throw new AppError("Todo tidak ditemukan", 404);
    }
    return Todo.where("_id", id).delete();
  }
}
export default Todo;
