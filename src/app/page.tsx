import AuthButton from "@/components/app/common/AuthButton";
import ConversationList from "@/components/app/conversation/ConversationList";

export default function Home() {
  return (
    <div className="pt-4">
      <AuthButton />
      <ConversationList />
    </div>
  );
}
