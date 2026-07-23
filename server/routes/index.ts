import express, { Request, Response } from "express";
import UserRouter from "./users";
import RoomRouter from "./rooms";
import MemberRouter from "./members";
import ScheduleRouter from "./schedules";
import SubjectRouter from "./subjects";
import TodoRouter from "./todos";
import LivekitRouter from "./livekit";
import MessageRouter from "./messages";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("This is the studeo db!");
});

router.use("/users", UserRouter);
router.use("/rooms", RoomRouter);
router.use("/members", MemberRouter);
router.use("/schedules", ScheduleRouter);
router.use("/subjects", SubjectRouter);
router.use("/todos", TodoRouter);
router.use("/messages", MessageRouter);
router.use("/livekit", LivekitRouter);

export default router;
