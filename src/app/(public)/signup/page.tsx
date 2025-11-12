import { AuthForm } from "@/components/app/auth/AuthForm";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm variant="signup" />
    </div>
  );
}
