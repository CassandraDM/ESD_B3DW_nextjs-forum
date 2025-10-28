import DeleteButton from "@/components/app/common/DeleteButton";
import ConversationService from "@/services/conversation.service";

interface ConversationDeleteButtonProps {
  className?: string;
  id: string;
}

export default function ConversationDeleteButton({
  id,
  className,
}: ConversationDeleteButtonProps) {
  return (
    <DeleteButton
      className={className}
      entityName="Conversation"
      id={id}
      onDelete={ConversationService.deleteById}
      queryKey="conversations"
    />
  );
}
