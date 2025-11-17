"use client";

import { Message } from "@/generated/prisma";
import DeleteButton from "../common/DeleteButton";
import MessageService from "@/services/message.service";
import { useSession } from "@/hooks/useSession";

interface MessageItemProps {
  message: Message & {
    author?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  };
}

export default function MessageItem({ message }: MessageItemProps) {
  const { session } = useSession();
  const isOwner = session?.user?.id === message.authorId;

  return (
    <div className="border shadow-sm rounded-md p-8 relative">
      {isOwner && (
        <DeleteButton
          className="absolute top-2 right-2"
          entityName="Message"
          queryKey="messages"
          onDelete={MessageService.deleteById}
          id={message.id}
        />
      )}
      <div className="flex flex-col gap-2">
        {message.author && (
          <p className="text-sm font-medium text-muted-foreground">
            {message.author.name || message.author.email}
          </p>
        )}
        <p>{message.content}</p>
      </div>
    </div>
  );
}
