import { Socket } from "socket.io";
import { verifyToken } from "../helpers/jwt";

export interface AuthenticatedSocket extends Socket {
    user?: {
        _id: string;
        username?: string;
    };
}

export function socketAuth(
    socket: AuthenticatedSocket,
    next: (err?: Error) => void,
) {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error("Token dibutuhkan buat konek ke socket"));
    }

    try {
        const decoded = verifyToken(token) as { _id: string; username?: string };
        socket.user = decoded;
        next();
    } catch (error) {
        next(new Error("Token tidak valid"));
    }
}