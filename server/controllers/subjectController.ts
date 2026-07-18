import { NextFunction, Request, Response } from "express";
import Subject from "../models/Subject";

interface IParams {
  id: string;
}

class SubjectController {
  static async getSubjects(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await Subject.getSubjects();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getSubjectById(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await Subject.getSubjectById(req.params.id);
      res
        .status(data ? 200 : 404)
        .json(data ?? { message: "Subject not found" });
    } catch (error) {
      next(error);
    }
  }

  static async createSubject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await Subject.createSubject(req.body);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async updateSubject(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await Subject.updateSubject(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubject(
    req: Request<IParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await Subject.deleteSubject(req.params.id);
      res.status(200).json({ message: "Subject has been deleted succesfully" });
    } catch (error) {
      next(error);
    }
  }
}
export default SubjectController;
