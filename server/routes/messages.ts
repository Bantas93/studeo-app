import express from "express";
import MessageController from "../controllers/messageController";

const MessageRouter = express.Router();

MessageRouter.get("/room/:roomId", MessageController.getMessagesByRoom);

export default MessageRouter;
