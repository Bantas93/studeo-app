import { useState } from "react";

interface Message {
  id: string;
  sender: string;
  text: string;
  isMe: boolean;
}

interface IProps {
  id: string;
}

export default function ChatRoomsList({ id }: IProps) {
  const [message, setMessage] = useState("");

  const [messages] = useState<Message[]>([
    {
      id: "1",
      sender: "Budi",
      text: "Halo semuanya! Selamat datang.",
      isMe: false,
    },
    {
      id: "2",
      sender: "Anda",
      text: "Halo! Room ini siap dipasang Socket.io.",
      isMe: true,
    },
  ]);

  const handleSendMessage = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    console.log(`Kirim pesan ke room ${id} via socket:`, message);
    setMessage("");
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-base-100">
      {/* Header Chat */}
      <div className="navbar bg-base-200 border-b border-base-300 px-4 flex justify-between">
        <div className="flex justify-between w-full">
          <span className="font-bold text-lg text-base-content">
            Room Chat #{id}
          </span>
          <div className="btn">Video/Voice Call</div>
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
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat ${msg.isMe ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-header text-xs opacity-50 mb-1">
              {msg.sender}
            </div>
            <div
              className={`chat-bubble ${msg.isMe ? "chat-bubble-neutral" : "chat-bubble-primary"}`}
            >
              {msg.text}
            </div>
            <div className="chat-footer opacity-50 text-[10px] mt-1">12:30</div>
          </div>
        ))}
      </div>

      {/* Input Form*/}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-base-200 border-t border-base-300 flex gap-2"
      >
        <input
          type="text"
          placeholder="Tulis pesan di sini..."
          className="input input-bordered flex-1"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="btn btn-neutral">
          Kirim
        </button>
      </form>
    </div>
  );
}
