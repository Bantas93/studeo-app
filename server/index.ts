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

  socket.on("rooms_changed", () => {
    console.log(`[socket] rooms changed — broadcasting`);
    socket.broadcast.emit("rooms_updated");
  });

  socket.on("todos_changed", () => {
    console.log(`[socket] todos changed — broadcasting`);
    socket.broadcast.emit("todos_updated");
  });

  socket.on("members_changed", ({ roomId }: { roomId: string }) => {
    console.log(roomId, "<<<<<ROOMID");
    console.log(`[socket] members_updated for room ${roomId}`);
    socket.broadcast.emit("members_updated");
  });

  socket.on(
    "user_typing",
    ({
      roomId,
      userId,
      username,
    }: {
      roomId: string;
      userId: string;
      username: string;
    }) => {
      if (!roomId) return;
      socket.to(roomId).emit("user_typing", { userId, username });
    },
  );

  socket.on(
    "stop_typing",
    ({ roomId, userId }: { roomId: string; userId: string }) => {
      if (!roomId) return;
      socket.to(roomId).emit("stop_typing", { userId });
    },
  );
});

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
