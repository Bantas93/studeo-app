import express from "express";
import MessageController from "../controllers/messageController";
import { authentication } from "../middleware/authentication";

const MessageRouter = express.Router();

MessageRouter.use(authentication);

MessageRouter.get("/room/:roomId", MessageController.getMessagesByRoom);
MessageRouter.post("/", MessageController.sendMessage);

export default MessageRouter;
