"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRelativeTime } from "@/lib/date";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  FileText,
  Pencil,
  X,
  Check,
  Shield,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/hooks/useSession";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

interface UserProfileProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    bio: string | null;
    role: string;
    createdAt: string;
    conversations: Array<{
      id: string;
      title: string | null;
      createdAt: string;
      messages: Array<{ id: string }>;
      author: {
        id: string;
        name: string | null;
        email: string;
      } | null;
    }>;
    messages: Array<{
      id: string;
      content: string;
      createdAt: string;
      Conversation: {
        id: string;
        title: string | null;
      } | null;
      author: {
        id: string;
        name: string | null;
        email: string;
      } | null;
    }>;
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  const { session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isOwner = session?.user?.id === user.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; bio: string; avatar: string }) => {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name || null,
          bio: data.bio || null,
          avatar: data.avatar || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la mise à jour");
      }

      return response.json();
    },
    onSuccess: async () => {
      toast.success("Profil mis à jour avec succès !");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      // Forcer le refetch de la session pour mettre à jour le header
      await queryClient.refetchQueries({ queryKey: ["session"] });
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du profil");
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    form.reset({
      name: user.name || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset({
      name: user.name || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
    });
  };

  const handleSubmit = (data: { name: string; bio: string; avatar: string }) => {
    updateMutation.mutate(data);
  };

  const roleUpdateMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await fetch(`/api/users/${user.id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      router.refresh();
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="link">&larr; Retour à l'accueil</Button>
        </Link>
      </div>

      {/* Profil utilisateur */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4 relative">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={
                  isEditing && form.watch("avatar")
                    ? form.watch("avatar")
                    : user.avatar || undefined
                }
                alt={user.name || user.email}
              />
              <AvatarFallback className="text-2xl">
                {getInitials(
                  isEditing && form.watch("name")
                    ? form.watch("name")
                    : user.name,
                  user.email
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">URL de l'avatar</Label>
                    <Input
                      id="avatar"
                      {...form.register("avatar")}
                      placeholder="https://example.com/avatar.jpg"
                      type="url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...form.register("bio")}
                      placeholder="Décrivez-vous en quelques mots..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      size="sm"
                    >
                      {updateMutation.isPending ? (
                        <Spinner className="h-4 w-4 mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Enregistrer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateMutation.isPending}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">
                      {user.name || user.email}
                    </CardTitle>
                    {isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEdit}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
                    </span>
                    {isAdmin && !isOwner && (
                      <Select
                        value={user.role}
                        onValueChange={(value) => roleUpdateMutation.mutate(value)}
                        disabled={roleUpdateMutation.isPending}
                      >
                        <SelectTrigger className="h-7 w-32 text-xs">
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
                  {user.bio && (
                    <p className="text-sm text-muted-foreground mt-2">{user.bio}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Membre depuis {getRelativeTime(user.createdAt)}
                  </p>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{user.conversations.length}</p>
                <p className="text-sm text-muted-foreground">Conversations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{user.messages.length}</p>
                <p className="text-sm text-muted-foreground">Messages</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversations créées */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Conversations créées ({user.conversations.length})
        </h2>
        {user.conversations.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune conversation créée
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {user.conversations.map((conversation) => (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <Link href={`/conversations/${conversation.id}`}>
                    <div className="flex flex-col gap-2">
                      <h3 className="font-medium text-lg hover:text-primary transition-colors">
                        {conversation.title || "Sans titre"}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{getRelativeTime(conversation.createdAt)}</span>
                        <span>
                          {conversation.messages.length} message
                          {conversation.messages.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Messages postés */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messages postés ({user.messages.length})
        </h2>
        {user.messages.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun message posté
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {user.messages.map((message) => (
              <Card key={message.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    {message.Conversation && (
                      <Link
                        href={`/conversations/${message.Conversation.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Dans : {message.Conversation.title || "Sans titre"}
                      </Link>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {getRelativeTime(message.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

