import { auth } from "../../auth";
import { NextResponse } from "next/server";

/**
 * Vérifie si l'utilisateur est authentifié
 * Retourne la session ou null
 */
export async function getSession() {
  try {
    const session = await auth();
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 * Retourne une réponse 401 si non authentifié
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Non authentifié. Veuillez vous connecter." },
      { status: 401 }
    );
  }

  return null; // Pas d'erreur, l'utilisateur est authentifié
}

/**
 * Vérifie si l'utilisateur est propriétaire d'une conversation
 */
export async function isConversationOwner(
  conversationId: string,
  userId: string
): Promise<boolean> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { authorId: true },
    });

    return conversation?.authorId === userId;
  } catch (error) {
    console.error("Error checking conversation ownership:", error);
    return false;
  }
}

/**
 * Vérifie si l'utilisateur est propriétaire d'un message
 */
export async function isMessageOwner(
  messageId: string,
  userId: string
): Promise<boolean> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { authorId: true },
    });

    return message?.authorId === userId;
  } catch (error) {
    console.error("Error checking message ownership:", error);
    return false;
  }
}

/**
 * Récupère le rôle d'un utilisateur
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur est modérateur ou admin
 */
export async function isModeratorOrAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "MODERATOR" || role === "ADMIN";
}

/**
 * Vérifie si l'utilisateur est admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "ADMIN";
}

/**
 * Vérifie si l'utilisateur peut supprimer une conversation
 * (propriétaire OU modérateur/admin)
 */
export async function canDeleteConversation(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const isOwner = await isConversationOwner(conversationId, userId);
  if (isOwner) return true;

  return await isModeratorOrAdmin(userId);
}

/**
 * Vérifie si l'utilisateur peut supprimer un message
 * (propriétaire OU modérateur/admin)
 */
export async function canDeleteMessage(
  messageId: string,
  userId: string
): Promise<boolean> {
  const isOwner = await isMessageOwner(messageId, userId);
  if (isOwner) return true;

  return await isModeratorOrAdmin(userId);
}

/**
 * Vérifie si l'utilisateur peut modifier une conversation
 * (propriétaire uniquement)
 */
export async function canEditConversation(
  conversationId: string,
  userId: string
): Promise<boolean> {
  return await isConversationOwner(conversationId, userId);
}

/**
 * Vérifie si l'utilisateur peut modifier un message
 * (propriétaire uniquement)
 */
export async function canEditMessage(
  messageId: string,
  userId: string
): Promise<boolean> {
  return await isMessageOwner(messageId, userId);
}


