import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession, requireAuth, isConversationOwner } from "@/lib/auth-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Vérifier l'authentification - les GET nécessitent une connexion
  const authError = await requireAuth();
  if (authError) {
    return authError;
  }

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      messages: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(conversation);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  // Vérifier que la conversation existe
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  // Vérifier l'ownership
  const isOwner = await isConversationOwner(id, session.user.id);
  if (!isOwner) {
    return NextResponse.json(
      { error: "Vous n'êtes pas autorisé à supprimer cette conversation" },
      { status: 403 }
    );
  }

  // Supprimer la conversation
  const deletedConversation = await prisma.conversation.delete({
    where: { id },
  });

  return NextResponse.json(deletedConversation);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const body = await request.json();

  // Vérifier que la conversation existe
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  // Vérifier l'ownership
  const isOwner = await isConversationOwner(id, session.user.id);
  if (!isOwner) {
    return NextResponse.json(
      { error: "Vous n'êtes pas autorisé à modifier cette conversation" },
      { status: 403 }
    );
  }

  // Mettre à jour la conversation
  const updatedConversation = await prisma.conversation.update({
    where: { id },
    data: {
      title: body.title,
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

  return NextResponse.json(updatedConversation);
}
