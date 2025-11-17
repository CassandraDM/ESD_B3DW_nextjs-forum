import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { session: null, authenticated: false },
        { status: 200 }
      );
    }

    // Récupérer les données utilisateur à jour depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { session: null, authenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        session: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar || undefined,
            role: user.role,
          },
        },
        authenticated: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in session:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la session" },
      { status: 500 }
    );
  }
}
