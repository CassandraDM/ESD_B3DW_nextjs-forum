import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession, requireAuth, isAdmin } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authError = await requireAuth();
    if (authError) {
      return authError;
    }

    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    const userIsAdmin = await isAdmin(session.user.id);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent accéder à cette liste" },
        { status: 403 }
      );
    }

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            conversations: true,
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

