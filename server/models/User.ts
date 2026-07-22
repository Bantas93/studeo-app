import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";
import { comparePassword, hashPassword } from "../helpers/bcrypt";
import { signToken } from "../helpers/jwt";

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
  username: z.string().trim().min(1),
  email: z.email(),
  password: z.string().trim().min(5, "Password minimal 5 karakter"),
  avatarUrl: z.string().optional(),
  isOnline: z.boolean().optional(),
});

const userUpdateSchema = userCreateSchema.partial();

class User extends Model<IUser> {
  public static $schema: IUser;
  protected $collection: string = "users";

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
    const result = userCreateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    const validPayload = result.data;

    const existingUsername = await User.where(
      "username",
      validPayload.username.trim().toLowerCase(),
    ).first();
    if (existingUsername) {
      throw new AppError("Username sudah digunakan", 400);
    }

    const existingEmail = await User.where(
      "email",
      validPayload.email.trim().toLowerCase(),
    ).first();
    if (existingEmail) {
      throw new AppError("Email sudah digunakan", 400);
    }

    validPayload.password = hashPassword(validPayload.password);

    const checkUser = await User.create({...validPayload, username: validPayload.username.toLowerCase()});
    const { password, ...user } = checkUser as IUser & { password?: string };

    return user;
  }

  static async updateUser(id: string, payload: UserUpdateInput) {
    const result = userUpdateSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validasi gagal";
      throw new AppError(message, 400);
    }

    const validPayload = result.data;

    if (validPayload.password) {
      validPayload.password = hashPassword(validPayload.password);
    }

    return User.where("_id", id).update(validPayload);
  }

  static async deleteUser(id: string) {
    return User.where("_id", id).delete();
  }

  static async login(payload: { username: string; password: string }) {
    const { username, password } = payload;

    if (!username || !password) {
      throw new AppError("Username dan password wajib diisi", 400);
    }

    const user = await User.where(
      "username",
      username.trim().toLowerCase(),
    ).first();

    if (!user) {
      throw new AppError("Username atau password salah", 401);
    }

    const isMatch = comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError("Username atau password salah", 401);
    }

    const access_token = signToken({
      _id: user._id,
      username: user.username,
    });

    const { password: _, ...userWithoutPassword } = user as IUser & {
      password?: string;
    };

    return {
      access_token,
      user: userWithoutPassword,
    };
  }
}

export default User;
