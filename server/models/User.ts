import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
} from "mongoloquent";

export interface IUser extends IMongoloquentSchema, IMongoloquentTimestamps {
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
  isOnline?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type UserInput = {
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
  isOnline?: boolean;
};

type UserUpdateInput = Partial<UserInput>;

class User extends Model<IUser> {
  public static $schema: IUser;
  protected $collection: string = "users";

  private static validatePayload(payload: UserUpdateInput, isCreate: boolean) {
    if (isCreate) {
      if (!payload.username || payload.username.trim() === "") {
        throw { message: "Username tidak boleh kosong", status: 400 };
      }

      if (!payload.email || payload.email.trim() === "") {
        throw { message: "Email tidak boleh kosong", status: 400 };
      }

      if (!payload.password || payload.password.trim() === "") {
        throw { message: "Password tidak boleh kosong", status: 400 };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        throw { message: "Format email tidak valid", status: 400 };
      }
    } else {
      if (payload.username !== undefined && payload.username.trim() === "") {
        throw { message: "Username tidak boleh kosong", status: 400 };
      }

      if (payload.email !== undefined && payload.email.trim() === "") {
        throw { message: "Email tidak boleh kosong", status: 400 };
      }

      if (payload.password !== undefined && payload.password.trim() === "") {
        throw { message: "Password tidak boleh kosong", status: 400 };
      }

      if (payload.email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
          throw { message: "Format email tidak valid", status: 400 };
        }
      }
    }
  }

  static async getAllUsers() {
    return User.all();
  }

  static async getUserById(id: string) {
    return User.find(id);
  }

  static async createUser(payload: UserInput) {
    User.validatePayload(payload, true);
    return User.create(payload);
  }

  static async updateUser(id: string, payload: UserUpdateInput) {
    User.validatePayload(payload, false);
    return User.where("_id", id).update(payload);
  }

  static async deleteUser(id: string) {
    return User.where("_id", id).delete();
  }
}

export default User;
