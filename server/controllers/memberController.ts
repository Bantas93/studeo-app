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
      const data = await Member.createMember(req.body);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }


  // todo may not use
  // static async getMembers(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ): Promise<void> {
  //   try {
  //     const data = await Member.getMembers();
  //     res.status(200).json(data);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

//   static async updateMember(
//     req: Request<IParams>,
//     res: Response,
//     next: NextFunction,
//   ): Promise<void> {
//     try {
//       const result = await Member.updateMember(req.params.id, req.body);
//       res.status(200).json(result);
//     } catch (error) {
//       next(error);
//     }
//   }
//
//   static async deleteMember(
//     req: Request<IParams>,
//     res: Response,
//     next: NextFunction,
//   ): Promise<void> {
//     try {
//       const result = await Member.deleteMember(req.params.id);
//       res.status(200).json({ message: "Member has been deleted succesfully" });
//     } catch (error) {
//       next(error);
//     }
//   }
}
export default MemberController;
