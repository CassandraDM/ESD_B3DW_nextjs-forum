"use client";

import { useSession } from "@/hooks/useSession";
import ConversationDeleteButton from "./ConversationDeleteButton";

interface ConversationHeaderProps {
  conversation: {
    id: string;
    title: string;
    authorId: string | null;
    author?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  };
}

export default function ConversationHeader({
  conversation,
}: ConversationHeaderProps) {
  const { session } = useSession();
  const isOwner = session?.user?.id === conversation.authorId;

  return (
    <div className="p-4 rounded-md text-xl flex flex-col gap-2 relative">
      <div className="flex items-center gap-2">
        <span>Subject:</span>
        <h1>{conversation?.title}</h1>
      </div>
      {conversation?.author && (
        <p className="text-sm text-muted-foreground">
          Par {conversation.author.name || conversation.author.email}
        </p>
      )}
      {isOwner && (
        <div className="absolute top-4 right-4">
          <ConversationDeleteButton id={conversation.id} />
        </div>
      )}
    </div>
  );
}

