import express from "express";
import MemberController from "../controllers/memberController";

const MemberRouter = express.Router();

MemberRouter.get("/", MemberController.getMembers);
MemberRouter.get("/:id", MemberController.getMemberById);
MemberRouter.post("/", MemberController.createMember);
MemberRouter.put("/:id", MemberController.updateMember);
MemberRouter.delete("/:id", MemberController.deleteMember);

export default MemberRouter;
