"use client";

import { Message } from "@/generated/prisma";
import MessageService from "@/services/message.service";
import { useEffect, useState } from "react";
import MessageItem from "./MessageItem";

interface MessageListProps {
  conversationId?: string;
}

export default function MessageList({ conversationId }: MessageListProps) {
  const [messageList, setMessageList] = useState<Message[]>([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await MessageService.fetchMessages({ conversationId });
      setMessageList(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  return (
    <div>
      {messageList.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {messageList.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
