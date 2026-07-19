import express from "express";
import RoomController from "../controllers/roomController";
import { authentication } from "../middleware/authentication";

const RoomRouter = express.Router();

RoomRouter.get("/", RoomController.getRooms);
RoomRouter.get("/:id", RoomController.getRoomById);
RoomRouter.post("/", authentication, RoomController.createRoom);
RoomRouter.put("/:id", RoomController.updateRoom);
RoomRouter.delete("/:id", authentication, RoomController.deleteRoom);

export default RoomRouter;
