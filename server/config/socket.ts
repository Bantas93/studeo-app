import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { socketAuth } from "../middleware/socketAuth";
import { chatHandler } from "../sockets/chatHandler";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
    if (!process.env.CLIENT_URL) {
        console.warn(
            "[socket] CLIENT_URL belum di-set di .env, pakai fallback http://localhost:5173. Koneksi dari client lain bakal ke-block CORS.",
        );
    }

    io = new Server(httpServer, {
        cors: {
            origin: [
                process.env.CLIENT_URL || "http://localhost:5173",
                "https://admin.socket.io",
            ],
            credentials: true,
        },
    });

    instrument(io, {
        auth: false,
        mode: "development",
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