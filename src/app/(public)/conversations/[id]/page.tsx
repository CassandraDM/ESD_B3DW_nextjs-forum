import MessageList from "@/components/app/message/MessageList";

export default async function ConversationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  console.log("Conversation ID:", params.id);
  const response = await fetch(
    `http://localhost:3000/api/conversations/${params.id}`
  );
  const conversation = await response.json();

  return (
    <div className="container mx-auto">
      <h1>{conversation?.title}</h1>

      <div>
        <MessageList conversationId={params.id} />
      </div>
    </div>
  );
}
