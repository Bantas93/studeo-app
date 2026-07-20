import express from "express";
import MemberController from "../controllers/memberController";

const MemberRouter = express.Router();

MemberRouter.get("/room/:id", MemberController.getMembersByRoomId);
MemberRouter.post("/", MemberController.createMember);

export default MemberRouter;
