import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

interface IPayload {
  _id: ObjectId;
  username?: string;
}

const SECRET_KEY = process.env.JWT_SECRET || "stUd30";

export function signToken(payload: IPayload): string {
  return jwt.sign(payload, SECRET_KEY);
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET_KEY);
}
