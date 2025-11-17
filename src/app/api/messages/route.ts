import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession, requireAuth } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  // GET reste public pour la lecture (affichage des messages)
  // Les modifications (POST, DELETE, PATCH) nécessitent une authentification
  const { searchParams } = new URL(request.url);

  const whereClause = { deletedAt: null };

  const conversationId = searchParams.get("conversationId");

  if (conversationId) {
    Object.assign(whereClause, { conversationId });
  }

  const isDelatedAt = searchParams.get("deletedAt");

  if (isDelatedAt) {
    Object.assign(whereClause, { isDelatedAt });
  }

  const messages = await prisma.message.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: whereClause,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  // Vérifier l'authentification
  const authError = await requireAuth();
  if (authError) {
    return authError;
  }

  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Non authentifié. Veuillez vous connecter." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { content, conversationId } = body;

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Le contenu du message est requis" },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "L'ID de la conversation est requis" },
        { status: 400 }
      );
    }

    // Vérifier que la conversation existe
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Créer le message avec l'authorId de l'utilisateur connecté
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        conversationId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du message" },
      { status: 500 }
    );
  }
}
