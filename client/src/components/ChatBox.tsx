import { useEffect, useRef, useState } from "react"
import { useChat } from "../hooks/useChat"

interface ChatBoxProps {
    roomId: string
    currentUserId: string
}

export default function ChatBox({ roomId, currentUserId }: ChatBoxProps) {
    const { messages, onlineUsers, error, loading, sendMessage } = useChat(roomId)
    const [draft, setDraft] = useState("")
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        if (!draft.trim()) return

        sendMessage(draft.trim())
        setDraft("")
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="loading loading-spinner loading-md" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-2 text-sm text-base-content/60 border-b border-base-300">
                {onlineUsers.length} orang online
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`chat ${message.userId === currentUserId ? "chat-end" : "chat-start"}`}
                    >
                        <div className="chat-header">
                            {message.username}
                        </div>
                        <div className="chat-bubble">{message.content}</div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {error && (
                <div className="px-4 py-1 text-sm text-error">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-base-300">
                <input
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Ketik pesan..."
                    className="input input-bordered flex-1"
                />
                <button type="submit" className="btn btn-primary">
                    Kirim
                </button>
            </form>
        </div>
    )
}