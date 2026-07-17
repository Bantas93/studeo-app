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

  static async getAllUsers() {
    return User.all();
  }

  static async getUserById(id: string) {
    return User.find(id);
  }

  static async createUser(payload: UserInput) {
    return User.create(payload);
  }

  static async updateUser(id: string, payload: UserUpdateInput) {
    return User.where("_id", id).update(payload);
  }

  static async deleteUser(id: string) {
    return User.where("_id", id).delete();
  }
}

export default User;
