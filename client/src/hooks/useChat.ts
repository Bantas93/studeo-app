import { useEffect, useRef, useState } from "react"
import { getSocket, SOCKET_URL } from "../lib/socket"

export interface ChatMessage {
    id: string
    roomId: string
    userId: string
    username?: string
    content: string
    createdAt: string
}

interface RawMessage {
    _id: string
    roomId: string
    userId: string
    username?: string
    content: string
    createdAt: string
}

export function useChat(roomId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const socketRef = useRef(getSocket())

    useEffect(() => {
        let cancelled = false
        const socket = socketRef.current

        setLoading(true)
        setMessages([])

        fetch(`${SOCKET_URL}/messages/room/${roomId}`)
            .then((res) => res.json())
            .then((data: RawMessage[]) => {
                if (cancelled) return

                const history = data.map((raw) => ({
                    id: raw._id,
                    roomId: raw.roomId,
                    userId: raw.userId,
                    username: raw.username,
                    content: raw.content,
                    createdAt: raw.createdAt
                }))
                
                setMessages(history)
            })
            .catch(() => {
                if (!cancelled) setError("Gagal memuat riwayat chat")
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        if (!socket.connected) {
            socket.connect()
        }

        socket.emit("joinRoom", roomId)

        function handleNewMessage(message: ChatMessage) {
            setMessages((prev) => [...prev, message])
        }

        function handleUserJoined({ userId }: { userId: string }) {
            setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]))
        }

        function handleUserLeft({ userId }: { userId: string }) {
            setOnlineUsers((prev) => prev.filter((id) => id !== userId))
        }

        function handleErrorMessage(message: string) {
            setError(message)
        }

        socket.on("newMessage", handleNewMessage)
        socket.on("userJoined", handleUserJoined)
        socket.on("userLeft", handleUserLeft)
        socket.on("errorMessage", handleErrorMessage)

        return () => {
            cancelled = true
            socket.emit("leaveRoom", roomId)
            socket.off("newMessage", handleNewMessage)
            socket.off("userJoined", handleUserJoined)
            socket.off("userLeft", handleUserLeft)
            socket.off("errorMessage", handleErrorMessage)
        }
    }, [roomId])

    function sendMessage(content: string) {
        socketRef.current.emit("sendMessage", { roomId, content })
    }

    return { messages, onlineUsers, error, loading, sendMessage }
}