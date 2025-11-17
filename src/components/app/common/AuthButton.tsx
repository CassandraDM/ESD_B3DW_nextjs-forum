"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { User, LogOut, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    onSuccess: async () => {
      toast.success("Déconnexion réussie");
      // Invalider toutes les queries liées à la session
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      // Forcer le refetch immédiat de la session
      await queryClient.refetchQueries({ queryKey: ["session"] });
      // Rediriger et rafraîchir
      router.push("/");
      // Utiliser setTimeout pour laisser le temps au cookie d'être supprimé
      setTimeout(() => {
        router.refresh();
        window.location.href = "/";
      }, 100);
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
    const getInitials = (name: string | null, email: string) => {
      if (name) {
        return name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      }
      return email[0].toUpperCase();
    };

    return (
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-auto p-2 hover:bg-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={session.user.image || undefined}
                  alt={session.user.name || session.user.email}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(session.user.name, session.user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {session.user.name || session.user.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {session.user.name || "Utilisateur"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/users/${session.user.id}`} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Mon profil
              </Link>
            </DropdownMenuItem>
            {session.user.role === "ADMIN" && (
              <DropdownMenuItem asChild>
                <Link href="/admin/users" className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  Gestion des utilisateurs
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
