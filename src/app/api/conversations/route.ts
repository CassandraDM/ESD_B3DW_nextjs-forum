import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getSession, requireAuth } from "@/lib/auth-utils";

export async function GET() {
  // GET reste public pour la lecture (affichage des conversations)
  // Les modifications (POST, DELETE, PATCH) nécessitent une authentification
  const conversations = await prisma.conversation.findMany({
    include: {
      messages: {
        select: { id: true },
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    where: {
      deletedAt: null,
    },
  });

  return NextResponse.json(conversations);
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
    const { title } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Le titre est requis" },
        { status: 400 }
      );
    }

    // Créer la conversation avec l'authorId de l'utilisateur connecté
    const conversation = await prisma.conversation.create({
      data: {
        title: title.trim(),
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

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la conversation" },
      { status: 500 }
    );
  }
}
