import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { socket } from "../lib/socket.ts";
import ChatSidebar from "../components/ChatSidebar";
import ChatRoomsList from "../components/ChatRoomList";

export interface IMessage {
  _id: string;
  roomId: string;
  userId: string;
  username?: string;
  content: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const roomName = id?.split("-")[0] ?? "";
  const roomId = id?.split("-")[1] ?? "";

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("access_token");

  const currentUserId = (() => {
    try {
      if (!token) return "";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload._id || "";
    } catch {
      return "";
    }
  })();

  useEffect(() => {
    if (!token || !roomId) return;
    let cancelled = false;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/messages/room/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) {
          setMessages(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Gagal memuat pesan");
          setLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [roomId, token]);

  useEffect(() => {
    if (!roomId) return;

    const joinRoom = () => {
      socket.emit("join_room", roomId);
    };

    const handleReceiveMessage = (message: IMessage) => {
      if (message.roomId !== roomId) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    if (!socket.connected) {
      socket.connect();
    } else {
      joinRoom();
    }

    socket.on("connect", joinRoom);
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("receive_message", handleReceiveMessage);
      socket.emit("leave_room", roomId);
    };
  }, [roomId]);

  const handleSendMessage = async (content: string) => {
    if (!token) return;
    try {
      const { data } = await axios.post(
        `${API_URL}/messages`,
        { roomId, content },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessages((prev) => [...prev, data]);
      socket.emit("send_message", data);
    } catch {
      setError("Gagal mengirim pesan");
      setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <div className="drawer lg:drawer-open drawer-end h-screen overflow-hidden">
      <input id="chat-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col h-full overflow-hidden">
        <ChatRoomsList
          roomId={roomId}
          roomName={roomName}
          messages={messages}
          loading={loading}
          error={error}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
        />
      </div>

      <div className="drawer-side z-10">
        <label htmlFor="chat-drawer" className="drawer-overlay"></label>
        <ChatSidebar roomId={roomId} roomName={roomName} />
      </div>
    </div>
  );
}
