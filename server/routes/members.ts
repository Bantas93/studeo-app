import express from "express";
import MemberController from "../controllers/memberController";
import {authentication} from "../middleware/authentication";

const MemberRouter = express.Router();

MemberRouter.get("/room/:id", MemberController.getMembersByRoomId);
MemberRouter.post("/", MemberController.createMember);
MemberRouter.delete("/room/:id", authentication, MemberController.deleteMemberFromRoom);

export default MemberRouter;
