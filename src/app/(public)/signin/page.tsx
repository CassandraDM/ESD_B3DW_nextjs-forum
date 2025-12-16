import { AuthForm } from "@/components/app/auth/AuthForm";

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/";
  const error = params?.error;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
            <p className="font-semibold">Erreur de connexion</p>
            <p>
              {error === "oauth_error"
                ? "Impossible de se connecter avec ce fournisseur. Vérifiez votre configuration."
                : error}
            </p>
          </div>
        )}
        <AuthForm variant="signin" callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
