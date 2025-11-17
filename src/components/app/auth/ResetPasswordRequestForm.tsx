"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";

interface ResetPasswordRequestFormData {
  email: string;
}

export default function ResetPasswordRequestForm() {
  const form = useForm<ResetPasswordRequestFormData>();

  const mutation = useMutation({
    mutationFn: async (data: ResetPasswordRequestFormData) => {
      const response = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Vérifier si la réponse est du JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Réponse non-JSON reçue:", text);
        throw new Error("Erreur serveur : la réponse n'est pas au format JSON");
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la demande de réinitialisation");
      }

      return response.json();
    },
    onSuccess: (data: any) => {
      // En mode développement, afficher le lien si disponible
      if (data?.devResetLink) {
        toast.success(
          "Mode développement : Lien de réinitialisation disponible dans la console du serveur",
          {
            description: `Lien: ${data.devResetLink}`,
            duration: 10000,
          }
        );
        console.log("🔗 Lien de réinitialisation:", data.devResetLink);
      } else {
        toast.success(
          "Si cet email existe dans notre système, vous recevrez un email de réinitialisation."
        );
      }
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ResetPasswordRequestFormData) => {
    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Réinitialiser le mot de passe</CardTitle>
        <CardDescription>
          Entrez votre adresse email et nous vous enverrons un lien pour
          réinitialiser votre mot de passe.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              {...form.register("email", {
                required: "L'email est requis",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email invalide",
                },
              })}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Spinner className="mr-2" />}
            Envoyer l'email de réinitialisation
          </Button>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Vous vous souvenez de votre mot de passe ?{" "}
            </span>
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href="/signin">Se connecter</Link>
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

