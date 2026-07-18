import { io, Socket } from "socket.io-client"

export const SOCKET_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

let socket: Socket | null = null

export function getSocket() {
    if (!socket) {
        const token = localStorage.getItem("token")

        socket = io(SOCKET_URL, {
            auth: { token },
            autoConnect: false
        })
    }

    return socket
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}