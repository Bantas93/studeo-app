import express from "express";
import ScheduleController from "../controllers/scheduleController";

const ScheduleRouter = express.Router();

ScheduleRouter.get("/room/:roomId", ScheduleController.getSchedulesByRoomId);
ScheduleRouter.get("/:id", ScheduleController.getScheduleById);
ScheduleRouter.post("/", ScheduleController.createSchedule);
ScheduleRouter.put("/:id", ScheduleController.updateSchedule);
ScheduleRouter.delete("/:id", ScheduleController.deleteSchedule);

export default ScheduleRouter;
