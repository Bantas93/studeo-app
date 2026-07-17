import {
  Model,
  IMongoloquentSchema,
  IMongoloquentTimestamps,
  DB,
} from "mongoloquent";
import { server } from "../config/dns";
server();

interface IUser extends IMongoloquentSchema, IMongoloquentTimestamps {
  username: string;
  email: string;
  password: string;
  avatarUrl: string;
  isOnline: boolean;
}

export default class User extends Model<IUser> {
  static async addUser() {
    await DB.collection<IUser>("users").insert({
      username: "johndoe",
      email: "john@mail.com",
      password: "password",
      avatarUrl: "https://cdn-icons-png.magnific.com/512/3135/3135715.png",
      isOnline: true,
    });
  }
  public static $schema: IUser;
}
