import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { socketAuth } from "../middleware/socketAuth";
import { chatHandler } from "../sockets/chatHandler";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    io.use(socketAuth);

    io.on("connection", (socket) => {
        chatHandler(io as Server, socket);
    });

    return io;
}

export function getIO() {
    if (!io) {
        throw new Error(
            "Socket.io belum di-init, panggil initSocket dulu di index.ts",
        );
    }
    return io;
}