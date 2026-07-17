import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";
import { ObjectId } from "mongodb";

export interface IUser extends IMongoloquentSchema, IMongoloquentTimestamps {
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
  isOnline?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserInput = {
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
  isOnline?: boolean;
};

export type UserUpdateInput = Partial<UserInput>;

const userCreateSchema = z.object({
  username: z.string().trim().min(1, "Username tidak boleh kosong"),
  email: z.email("Format email tidak valid"),
  password: z.string().trim().min(5, "Password minimal 5 karakter"),
  avatarUrl: z.string(),
  isOnline: z.boolean(),
});

const userUpdateSchema = userCreateSchema.partial();

class User extends Model<IUser> {
  public static $schema: IUser;
  protected $collection: string = "users";

  private static validatePayload(payload: unknown, isCreate: boolean) {
    const schema = isCreate ? userCreateSchema : userUpdateSchema;
    const result = schema.safeParse(payload);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    return result.data;
  }

  private static async checkDuplicate(payload: UserInput) {
    const username = payload.username.trim().toLowerCase();
    const email = payload.email.trim().toLowerCase();

    const existingUsername = await User.where("username", username).first();
    if (existingUsername) {
      throw new AppError("Username sudah digunakan", 400);
    }

    const existingEmail = await User.where("email", email).first();
    if (existingEmail) {
      throw new AppError("Email sudah digunakan", 400);
    }
  }

  static async getAllUsers() {
    return User.all();
  }

  static async getUserById(id: string) {
    const findUser = await User.find(id);
    const user = {
      username: findUser.username,
      email: findUser.email,
      avatarUrl: findUser.avatarUrl,
      isOnline: findUser.isOnline,
      createdAt: findUser.createdAt,
      updatedAt: findUser.updatedAt,
    };
    return user;
  }

  static async createUser(payload: UserInput) {
    const validPayload = User.validatePayload(payload, true) as UserInput;
    await User.checkDuplicate(validPayload);
    const checkUser = await User.create(validPayload);
    const { password, ...user } = checkUser as IUser & { password?: string };

    return user;
  }

  static async updateUser(id: string, payload: UserUpdateInput) {
    const validPayload = User.validatePayload(
      payload,
      false,
    ) as UserUpdateInput;
    return User.where("_id", id).update(validPayload);
  }

  static async deleteUser(id: string) {
    return User.where("_id", id).delete();
  }
}

export default User;
