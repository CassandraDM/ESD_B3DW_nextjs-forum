import AuthButton from "@/components/app/common/AuthButton";
import ConversationList from "@/components/app/conversation/ConversationList";
import ConversationForm from "@/components/app/conversation/ConversationForm";

export default function Home() {
  return (
    <div className="pt-4">
      <AuthButton />
      <div className="container mx-auto">
        <ConversationForm />
      </div>
      <ConversationList />
    </div>
  );
}
