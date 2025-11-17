"use client";

import MessageService from "@/services/message.service";

import MessageItem from "./MessageItem";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageListProps {
  conversationId?: string;
}

export default function MessageList({ conversationId }: MessageListProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      return await MessageService.fetchMessages({ conversationId });
    },
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-20 w-full mb-2" />
        <Skeleton className="h-20 w-full mb-2" />
        <Skeleton className="h-20 w-full mb-2" />
        <Skeleton className="h-20 w-full mb-2" />
        <Skeleton className="h-20 w-full mb-2" />
      </div>
    );
  }

  if (isError) {
    return <p>Error loading messages.</p>;
  }

  if (!data || data.length === 0) {
    return <p>No messages found.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
