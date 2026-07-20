import { NextFunction, Request, Response } from "express";
import Member from "../models/Member";

interface IParams {
  id: string;
}

class MemberController {
  static async getMembersByRoomId(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const members = await Member.getMembersByRoomId(req.params.id);
      res
        .status(200)
        .json(members);
    } catch (error) {
      next(error);
    }
  }

  static async createMember(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await Member.createMember(req.body);
      res.status(201).json();
    } catch (error) {
      next(error);
    }
  }

}
export default MemberController;
