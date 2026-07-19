import { Server } from "socket.io";
import Message from "../models/Message";
import Room from "../models/Room";
import Member from "../models/Member";
import { AuthenticatedSocket } from "../middleware/socketAuth";

const SEND_MESSAGE_COOLDOWN_MS = 500;
const lastSentAt = new Map<string, number>();

async function isRoomMember(roomId: string, userId: string) {
    const room = await Room.find(roomId);
    if (!room) return false;

    const membership = await Member.where("roomId", roomId)
        .where("userId", userId)
        .where("status", "approved")
        .first();

    return Boolean(membership);
}

export function chatHandler(io: Server, socket: AuthenticatedSocket) {
    socket.on("joinRoom", async (roomId: unknown) => {
        try {
            if (!socket.user || typeof roomId !== "string" || !roomId.trim()) {
                return socket.emit("errorMessage", "roomId tidak valid");
            }

            const allowed = await isRoomMember(roomId, socket.user._id);
            if (!allowed) {
                return socket.emit("errorMessage", "Kamu bukan member room ini");
            }

            socket.join(roomId);
            socket.to(roomId).emit("userJoined", {
                userId: socket.user._id,
                username: socket.user.username,
            });
        } catch (error) {
            socket.emit("errorMessage", "Gagal join room");
        }
    });

    socket.on("leaveRoom", (roomId: unknown) => {
        if (!socket.user || typeof roomId !== "string" || !roomId.trim()) {
            return;
        }

        socket.leave(roomId);
        socket.to(roomId).emit("userLeft", {
            userId: socket.user._id,
            username: socket.user.username,
        });
    });

    socket.on(
        "sendMessage",
        async ({ roomId, content }: { roomId: unknown; content: unknown }) => {
            try {
                if (!socket.user) return;

                if (typeof roomId !== "string" || typeof content !== "string") {
                    return socket.emit("errorMessage", "roomId dan content wajib diisi");
                }

                if (!socket.rooms.has(roomId)) {
                    return socket.emit("errorMessage", "Kamu belum join room ini");
                }

                const now = Date.now();
                const last = lastSentAt.get(socket.id) || 0;
                if (now - last < SEND_MESSAGE_COOLDOWN_MS) {
                    return socket.emit("errorMessage", "Jangan kirim pesan terlalu cepat");
                }
                lastSentAt.set(socket.id, now);

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

    socket.on("disconnecting", () => {
        if (!socket.user) return;

        for (const room of socket.rooms) {
            if (room === socket.id) continue;
            socket.to(room).emit("userOffline", { userId: socket.user._id });
        }
    });

    socket.on("disconnect", () => {
        lastSentAt.delete(socket.id);
    });
}