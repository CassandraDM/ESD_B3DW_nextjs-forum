"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AuthButton() {
  const router = useRouter();
  const { isAuthenticated, session, isLoading } = useSession();
  const queryClient = useQueryClient();

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la déconnexion");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Déconnexion réussie");
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  if (isLoading) {
    return <Button disabled>Chargement...</Button>;
  }

  if (isAuthenticated && session?.user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {session.user.name || session.user.email}
        </span>
        <Button variant="outline" onClick={handleSignOut}>
          Déconnexion
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => router.push("/signin")}>
        Se connecter
      </Button>
      <Button onClick={() => router.push("/signup")}>S'inscrire</Button>
    </div>
  );
}
