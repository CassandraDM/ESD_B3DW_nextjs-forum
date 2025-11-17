"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Shield, ShieldCheck, User as UserIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "@/hooks/useSession";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  _count: {
    conversations: number;
    messages: number;
  };
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des utilisateurs");
  }
  return response.json();
}

export default function UsersList() {
  const { session } = useSession();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
  });

  const roleUpdateMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la mise à jour du rôle");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Rôle mis à jour avec succès !");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du rôle");
    },
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrateur";
      case "MODERATOR":
        return "Modérateur";
      case "USER":
        return "Utilisateur";
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <ShieldCheck className="h-4 w-4" />;
      case "MODERATOR":
        return <Shield className="h-4 w-4" />;
      case "USER":
        return <UserIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "MODERATOR":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "USER":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Aucun utilisateur trouvé
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Link href={`/users/${user.id}`}>
                <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage
                    src={user.avatar || undefined}
                    alt={user.name || user.email}
                  />
                  <AvatarFallback>
                    {getInitials(user.name, user.email)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/users/${user.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {user.name || user.email}
                  </Link>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getRoleColor(
                      user.role
                    )}`}
                  >
                    {getRoleIcon(user.role)}
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{user._count.conversations} conversations</span>
                  <span>{user._count.messages} messages</span>
                </div>
              </div>
              {session?.user?.role === "ADMIN" &&
                session?.user?.id !== user.id && (
                  <Select
                    value={user.role}
                    onValueChange={(value) =>
                      roleUpdateMutation.mutate({ userId: user.id, role: value })
                    }
                    disabled={roleUpdateMutation.isPending}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Utilisateur</SelectItem>
                      <SelectItem value="MODERATOR">Modérateur</SelectItem>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

