import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession, requireAuth, isMessageOwner } from "@/lib/auth-utils";

export async function DELETE(
  request: NextRequest,
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

  // Vérifier que le message existe
  const message = await prisma.message.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Vérifier l'ownership
  const isOwner = await isMessageOwner(id, session.user.id);
  if (!isOwner) {
    return NextResponse.json(
      { error: "Vous n'êtes pas autorisé à supprimer ce message" },
      { status: 403 }
    );
  }

  // Supprimer le message
  const deletedMessage = await prisma.message.delete({
    where: { id },
  });

  return NextResponse.json(deletedMessage);
}

export async function PATCH(
  request: NextRequest,
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

  // Vérifier que le message existe
  const message = await prisma.message.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Vérifier l'ownership
  const isOwner = await isMessageOwner(id, session.user.id);
  if (!isOwner) {
    return NextResponse.json(
      { error: "Vous n'êtes pas autorisé à modifier ce message" },
      { status: 403 }
    );
  }

  // Validation du contenu
  if (
    !body.content ||
    typeof body.content !== "string" ||
    body.content.trim().length === 0
  ) {
    return NextResponse.json(
      { error: "Le contenu du message est requis" },
      { status: 400 }
    );
  }

  // Mettre à jour le message
  const updatedMessage = await prisma.message.update({
    where: { id },
    data: {
      content: body.content.trim(),
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

  return NextResponse.json(updatedMessage);
}
