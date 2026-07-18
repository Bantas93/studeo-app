import { Server } from "socket.io";
import Message from "../models/Message";
import { AuthenticatedSocket } from "../middleware/socketAuth";

export function chatHandler(io: Server, socket: AuthenticatedSocket) {
    socket.on("joinRoom", (roomId: string) => {
        socket.join(roomId);
        socket.to(roomId).emit("userJoined", {
            userId: socket.user?._id,
            username: socket.user?.username,
        });
    });

    socket.on("leaveRoom", (roomId: string) => {
        socket.leave(roomId);
        socket.to(roomId).emit("userLeft", {
            userId: socket.user?._id,
            username: socket.user?.username,
        });
    });

    socket.on(
        "sendMessage",
        async ({ roomId, content }: { roomId: string; content: string }) => {
            try {
                if (!socket.user) return;

                const message = await Message.sendMessage({
                    roomId,
                    userId: socket.user._id,
                    content,
                });

                io.to(roomId).emit("newMessage", {
                    id: message._id,
                    roomId,
                    userId: socket.user._id,
                    username: socket.user.username,
                    content,
                    createdAt: message.createdAt,
                });
            } catch (error) {
                socket.emit(
                    "errorMessage",
                    error instanceof Error ? error.message : "Gagal mengirim pesan",
                );
            }
        },
    );

    socket.on("disconnect", () => {
        socket.broadcast.emit("userOffline", {
            userId: socket.user?._id,
        });
    });
}