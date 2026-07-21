import { useRef, useState, useEffect } from "react";
import type { IMessage } from "../pages/ChatRoomPage";
import { Link } from "react-router";
import { socket } from "../lib/socket";
import ChatBubbles from "./ChatBubbles.tsx";

interface IProps {
  roomId: string;
  roomName: string;
  messages: IMessage[];
  loading: boolean;
  error: string | null;
  currentUserId: string;
  onSendMessage: (content: string) => void;
}

export default function ChatRoomsList({
  roomId,
  roomName,
  messages,
  loading,
  error,
  currentUserId,
  onSendMessage,
}: IProps) {
  const [draft, setDraft] = useState("");
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUsername = (() => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return "";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.username || "";
    } catch {
      return "";
    }
  })();

  useEffect(() => {
    if (draft.trim()) {
      socket.emit("user_typing", {
        roomId,
        userId: currentUserId,
        username: currentUsername,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", { roomId, userId: currentUserId });
      }, 3000);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      socket.emit("stop_typing", { roomId, userId: currentUserId });
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [draft, roomId, currentUserId, currentUsername]);

  useEffect(() => {
    const handleUserTyping = ({
      userId,
      username,
    }: {
      userId: string;
      username: string;
    }) => {
      if (userId === currentUserId) return;
      setTypingUsers((prev) => ({ ...prev, [userId]: username }));
    };

    const handleStopTyping = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    socket.on("user_typing", handleUserTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("user_typing", handleUserTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [currentUserId]);

  const handleSubmit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setDraft("");
    socket.emit("stop_typing", { roomId, userId: currentUserId });
  };

  const typingList = Object.entries(typingUsers).filter(
    ([uid]) => uid !== currentUserId,
  );

  if (loading) {
    return (
      <div className="flex flex-col flex-1 h-full bg-base-100">
        <div className="navbar bg-base-200 border-b border-base-300 px-4">
          <span className="font-bold text-lg text-base-content">
            Room Chat {roomName} <span>#{roomId}</span>
          </span>
        </div>
        <div className="flex items-center justify-center flex-1">
          <span className="loading loading-spinner loading-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-base-100/60 backdrop-blur">
      {/* Header Chat */}
      <div className="navbar bg-base-200/60 backdrop-blur border-b border-base-300 px-4 flex justify-between">
        <div className="flex justify-between w-full">
          <span className="font-bold text-lg text-base-content">
            Room Chat : {roomName.toUpperCase()}{" "}
            <span className="text-xs font-extralight">#{roomId}</span>
          </span>
          <Link
            to={`/room/calling/${roomName}-${roomId}`}
            className="btn btn-primary btn-sm"
          >
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
      <ChatBubbles messages={messages} userId={currentUserId} />

      {/* Error */}
      {error && (
        <div className="px-4 py-1 text-sm text-error bg-base-100">{error}</div>
      )}

      {/* ── Typing Indicator ── */}
      {typingList.length > 0 && (
        <div className="px-4 py-2 text-sm text-base-content/70 italic flex items-center gap-2">
          <span className="loading loading-dots loading-xs"></span>
          <span>
            {typingList.length === 1
              ? `${typingList[0][1]} sedang mengetik...`
              : `${typingList.length} orang sedang mengetik...`}
          </span>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="p-4 bg-base-200/60 backdrop-blur border-t border-base-300 flex gap-2"
      >
        <textarea
          placeholder="Tulis pesan di sini..."
          className="textarea textarea-bordered flex-1 resize-none"
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <button type="submit" className="btn btn-primary">
          Kirim
        </button>
      </form>
    </div>
  );
}
