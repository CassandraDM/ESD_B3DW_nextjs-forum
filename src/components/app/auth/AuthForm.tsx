"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Github, Google, Discord } from "react-bootstrap-icons";

interface AuthFormProps {
  variant: "signup" | "signin";
  callbackUrl?: string;
}

interface SignUpFormData {
  email: string;
  password: string;
  name: string;
}

interface SignInFormData {
  email: string;
  password: string;
}

export function AuthForm({ variant, callbackUrl = "/" }: AuthFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isSignUp = variant === "signup";

  const signUpForm = useForm<SignUpFormData>();
  const signInForm = useForm<SignInFormData>();

  // Vérifier quels providers OAuth sont disponibles
  const { data: availableProviders, isLoading: isLoadingProviders } = useQuery<{
    google: boolean;
    github: boolean;
    discord: boolean;
  }>({
    queryKey: ["oauth-providers"],
    queryFn: async () => {
      const response = await fetch("/api/auth/providers");
      if (!response.ok) {
        console.warn("[OAuth] Erreur lors de la récupération des providers");
        return { google: false, github: false, discord: false };
      }
      const data = await response.json();
      console.log("[OAuth] Providers disponibles:", data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache pendant 5 minutes
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'inscription");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Compte créé avec succès !");
      router.push("/signin");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SignInFormData) => {
      // Nettoyer les anciens cookies NextAuth avant la connexion
      // pour éviter l'accumulation qui cause l'erreur 431
      const cookiesToDelete = [
        `__Secure-next-auth.session-token`,
        `next-auth.session-token`,
        `__Secure-next-auth.csrf-token`,
        `next-auth.csrf-token`,
        `next-auth.callback-url`,
      ];

      cookiesToDelete.forEach((cookieName) => {
        // Supprimer avec différents chemins et domaines possibles
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      });

      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Inclure les cookies
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la connexion");
      }

      return response.json();
    },
    onSuccess: async () => {
      toast.success("Connexion réussie !");
      // Attendre un peu pour que le cookie soit défini
      await new Promise((resolve) => setTimeout(resolve, 100));
      // Invalider la query de session pour forcer le refetch
      queryClient.invalidateQueries({ queryKey: ["session"] });
      // Attendre encore un peu pour que le refetch se termine
      await new Promise((resolve) => setTimeout(resolve, 200));
      router.push(callbackUrl);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmitSignUp = async (data: SignUpFormData) => {
    signUpMutation.mutate(data);
  };

  const onSubmitSignIn = async (data: SignInFormData) => {
    signInMutation.mutate(data);
  };

  const handleOAuthSignIn = async (
    provider: "google" | "github" | "discord"
  ) => {
    console.log(`[OAuth] Clic sur ${provider}`);
    try {
      // Utiliser l'API NextAuth pour déclencher le OAuth signin
      const response = await fetch("/api/auth/oauth-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, callbackUrl }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la connexion OAuth");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("[OAuth] Erreur lors de la redirection:", error);
      toast.error("Erreur lors de la connexion");
    }
  };

  if (isSignUp) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Entrez vos informations pour créer un compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={signUpForm.handleSubmit(onSubmitSignUp)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Username</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...signUpForm.register("name", {
                    required: "Le nom est requis",
                    minLength: {
                      value: 2,
                      message:
                        "Le username doit contenir au moins 2 caractères",
                    },
                  })}
                />
                {signUpForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {signUpForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  {...signUpForm.register("email", {
                    required: "L'email est requis",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Format d'email invalide",
                    },
                  })}
                />
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...signUpForm.register("password", {
                    required: "Le mot de passe est requis",
                    minLength: {
                      value: 8,
                      message:
                        "Le mot de passe doit contenir au moins 8 caractères",
                    },
                  })}
                />
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <div className="flex justify-center items-center px-6 gap-2">
          <span className="text-sm text-muted-foreground">
            Vous avez déjà un compte ?
          </span>
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/signin">Se connecter</Link>
          </Button>
        </div>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            onClick={signUpForm.handleSubmit(onSubmitSignUp)}
            disabled={signUpMutation.isPending}
          >
            {signUpMutation.isPending && <Spinner className="mr-2" />}
            Créer un compte
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Se connecter</CardTitle>
        <CardDescription>
          Entrez vos identifiants pour vous connecter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={signInForm.handleSubmit(onSubmitSignIn)}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                {...signInForm.register("email", {
                  required: "L'email est requis",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Format d'email invalide",
                  },
                })}
              />
              {signInForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {signInForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Button variant="link" asChild className="p-0 h-auto text-xs">
                  <Link href="/reset-password">Mot de passe oublié ?</Link>
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...signInForm.register("password", {
                  required: "Le mot de passe est requis",
                })}
              />
              {signInForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {signInForm.formState.errors.password.message}
                </p>
              )}
            </div>
          </div>
        </form>
      </CardContent>
      <div className="flex justify-center items-center px-6 gap-2">
        <span className="text-sm text-muted-foreground">
          Pas encore de compte ?
        </span>
        <Button variant="link" asChild className="p-0 h-auto">
          <Link href="/signup">S'inscrire</Link>
        </Button>
      </div>
      <CardFooter className="flex-col gap-3">
        <Button
          type="submit"
          className="w-full"
          onClick={signInForm.handleSubmit(onSubmitSignIn)}
          disabled={signInMutation.isPending}
        >
          {signInMutation.isPending && <Spinner className="mr-2" />}
          Se connecter
        </Button>
        {(availableProviders?.google ||
          availableProviders?.github ||
          availableProviders?.discord) && (
          <div className="w-full flex flex-col gap-2">
            <p className="text-xs text-center text-muted-foreground">
              Ou continuer avec
            </p>
            <div className="flex flex-col gap-2">
              {availableProviders?.google && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("[OAuth] Bouton Google cliqué");
                    handleOAuthSignIn("google");
                  }}
                >
                  <Google className="w-4 h-4" />
                  Google
                </Button>
              )}
              {availableProviders?.github && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleOAuthSignIn("github")}
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
              )}
              {availableProviders?.discord && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleOAuthSignIn("discord")}
                >
                  <Discord className="w-4 h-4" />
                  Discord
                </Button>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
