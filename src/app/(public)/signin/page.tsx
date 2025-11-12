import { AuthForm } from "@/components/app/auth/AuthForm";

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm variant="signin" callbackUrl={callbackUrl} />
    </div>
  );
}
