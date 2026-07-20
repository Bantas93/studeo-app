import { useRef, useState, useEffect } from "react";
import type { IMessage } from "../pages/ChatRoomPage";
import { Link } from "react-router";
import { formatTime } from "../helpers/formatTime";

interface IProps {
  roomId: string;
  messages: IMessage[];
  loading: boolean;
  error: string | null;
  currentUserId: string;
  onSendMessage: (content: string) => void;
}

export default function ChatRoomsList({
  roomId,
  messages,
  loading,
  error,
  currentUserId,
  onSendMessage,
}: IProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setDraft("");
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 h-full bg-base-100">
        <div className="navbar bg-base-200 border-b border-base-300 px-4">
          <span className="font-bold text-lg text-base-content">
            Room Chat #{roomId}
          </span>
        </div>
        <div className="flex items-center justify-center flex-1">
          <span className="loading loading-spinner loading-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-base-100">
      {/* Header Chat */}
      <div className="navbar bg-base-200 border-b border-base-300 px-4 flex justify-between">
        <div className="flex justify-between w-full">
          <span className="font-bold text-lg text-base-content">
            Room Chat #{roomId}
          </span>
          <Link to={`/room/calling/${roomId}`} className="btn">
            Video/Voice Call
          </Link>
        </div>

        <label
          htmlFor="chat-drawer"
          className="btn btn-ghost drawer-button lg:hidden"
        >
          Menu
        </label>
      </div>

      {/* Area Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.userId === currentUserId;

          return (
            <div
              key={msg._id}
              className={`chat ${isMe ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-header text-xs opacity-50 mb-1">
                {msg.username ?? "Unknown"}
              </div>
              <div
                className={`chat-bubble ${isMe ? "chat-bubble-neutral" : "chat-bubble-primary"}`}
              >
                {msg.content}
              </div>
              <div className="chat-footer opacity-50 text-[10px] mt-1">
                {formatTime(msg.createdAt)}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-1 text-sm text-error bg-base-100">{error}</div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-base-200 border-t border-base-300 flex gap-2"
      >
        <input
          type="text"
          placeholder="Tulis pesan di sini..."
          className="input input-bordered flex-1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="btn btn-neutral">
          Kirim
        </button>
      </form>
    </div>
  );
}
