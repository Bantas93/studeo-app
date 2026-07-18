import express from "express";
import SubjectController from "../controllers/subjectController";

const SubjectRouter = express.Router();

SubjectRouter.get("/", SubjectController.getSubjects);
SubjectRouter.get("/:id", SubjectController.getSubjectById);
SubjectRouter.post("/create", SubjectController.createSubject);
SubjectRouter.put("/:id", SubjectController.updateSubject);
SubjectRouter.delete("/:id", SubjectController.deleteSubject);

export default SubjectRouter;
