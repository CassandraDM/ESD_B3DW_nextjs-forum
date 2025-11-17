import MessageForm from "@/components/app/message/MessageForm";
import MessageList from "@/components/app/message/MessageList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ConversationHeader from "@/components/app/conversation/ConversationHeader";

interface ConversationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationDetailPage({
  params,
}: ConversationDetailPageProps) {
  const { id } = await params;

  console.log("Conversation ID:", id);
  const response = await fetch(`http://localhost:3000/api/conversations/${id}`);
  const conversation = await response.json();

  return (
    <div className="container mx-auto">
      <div className="my-4">
        <Link href="/" className="flex items-center mb-4">
          <Button variant="link">&larr; Back to Conversations</Button>
        </Link>
      </div>

      <ConversationHeader conversation={conversation} />

      <div>
        <MessageForm conversationId={id} />
      </div>

      <div>
        <MessageList conversationId={id} />
      </div>
    </div>
  );
}
