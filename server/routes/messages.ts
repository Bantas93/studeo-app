import express from "express";
import MessageController from "../controllers/messageController";
import { getIO } from "../config/socket";

const MessageRouter = express.Router();

MessageRouter.get("/room/:roomId", MessageController.getMessagesByRoom);

// Endpoint baru: menerima hasil AI dari bot recorder
MessageRouter.post("/ai-result", (req, res) => {
  const { roomName, userId, transcript, aiResponse } = req.body;
  const io = getIO();

  io.to(roomName).emit("aiResponse", {
    userId,
    transcript,
    aiResponse,
  });

  res.json({ success: true });
});

export default MessageRouter;
