import express from "express";
import RoomController from "../controllers/roomController";

const RoomRouter = express.Router();

RoomRouter.get("/", RoomController.getRooms);
RoomRouter.get("/:id", RoomController.getRoomById);
RoomRouter.post("/", RoomController.createRoom);
RoomRouter.put("/:id", RoomController.updateRoom);
RoomRouter.delete("/:id", RoomController.deleteRoom);

export default RoomRouter;
