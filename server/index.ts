import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import Routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", Routes);

app.use(errorHandler);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  socket.on("join_room", (roomId: string) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`[socket] ${socket.id} join room ${roomId}`);
  });

  socket.on("leave_room", (roomId: string) => {
    if (!roomId) return;
    socket.leave(roomId);
    console.log(`[socket] ${socket.id} leave room ${roomId}`);
  });

  socket.on("send_message", (message) => {
    if (!message?.roomId) return;
    socket.to(message.roomId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log(`[socket] disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
