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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface ResetPasswordFormProps {
  token: string;
}

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const form = useForm<ResetPasswordFormData>();

  const mutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const response = await fetch("/api/auth/reset-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la réinitialisation");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Mot de passe réinitialisé avec succès !");
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Nouveau mot de passe</CardTitle>
        <CardDescription>
          Entrez votre nouveau mot de passe ci-dessous.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register("password", {
                required: "Le mot de passe est requis",
                minLength: {
                  value: 6,
                  message: "Le mot de passe doit contenir au moins 6 caractères",
                },
              })}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...form.register("confirmPassword", {
                required: "La confirmation du mot de passe est requise",
              })}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {form.formState.errors.confirmPassword.message}
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
            Réinitialiser le mot de passe
          </Button>
          <div className="text-center text-sm">
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href="/signin">Retour à la connexion</Link>
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

