import express from "express";
import MemberController from "../controllers/memberController";

const MemberRouter = express.Router();

MemberRouter.get("/room/:id", MemberController.getMembersByRoomId);
MemberRouter.post("/", MemberController.createMember);
// todo may not used
// MemberRouter.get("/", MemberController.getMembers);
// MemberRouter.put("/:id", MemberController.updateMember);
// MemberRouter.delete("/:id", MemberController.deleteMember);

export default MemberRouter;
