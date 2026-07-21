import { formatTime } from "../helpers/formatTime.tsx";
import type { IMessage } from "../pages/ChatRoomPage.tsx";
import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";

interface ChatBubbleInput {
  messages: IMessage[];
  userId: string;
}

export default function ChatBubbles(input: ChatBubbleInput) {
  const { messages, userId } = input;

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => {
        const isMe = msg.userId === userId;

        return (
          <div
            key={msg._id}
            className={`chat ${isMe ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-header text-xs opacity-50 mb-1">
              {msg.username ?? "Unknown"}
            </div>
            {msg.isBot ? (
              <div
                className="chat-bubble overflow-auto text-ellipsis bg-secondary/10 border-l-4 border-secondary backdrop-blur"
              >
                <Markdown remarkPlugins={[remarkBreaks]}>{msg.content}</Markdown>
              </div>
            ) : (
              <div
                className={`chat-bubble text-ellipsis whitespace-pre-wrap backdrop-blur ${isMe ? "bg-primary text-primary-content" : "bg-base-100"}`}
              >
                {msg.content}
              </div>
            )}

            <div className="chat-footer opacity-50 text-[10px] mt-1">
              {formatTime(msg.createdAt)}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
