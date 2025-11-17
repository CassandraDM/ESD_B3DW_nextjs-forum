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


