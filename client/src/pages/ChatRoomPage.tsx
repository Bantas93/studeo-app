import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const roomId = id ?? "";

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

  const handleSendMessage = async (content: string) => {
    if (!token) return;
    try {
      await axios.post(
        `${API_URL}/messages`,
        { roomId, content },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { data } = await axios.get(`${API_URL}/messages/room/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data);
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
          messages={messages}
          loading={loading}
          error={error}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
        />
      </div>

      <div className="drawer-side z-10">
        <label htmlFor="chat-drawer" className="drawer-overlay"></label>
        <ChatSidebar roomId={roomId} />
      </div>
    </div>
  );
}
