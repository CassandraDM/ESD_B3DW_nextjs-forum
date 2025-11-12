import { AuthForm } from "@/components/app/auth/AuthForm";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm variant="signin" />
    </div>
  );
}
