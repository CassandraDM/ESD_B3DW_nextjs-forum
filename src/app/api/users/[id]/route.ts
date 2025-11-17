import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession, requireAuth } from "@/lib/auth-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Récupérer l'utilisateur avec ses contributions
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
        conversations: {
          where: {
            deletedAt: null,
          },
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
        },
        messages: {
          where: {
            deletedAt: null,
          },
          include: {
            Conversation: {
              select: {
                id: true,
                title: true,
              },
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
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Vérifier que l'utilisateur modifie son propre profil
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: "Vous ne pouvez modifier que votre propre profil" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, bio, avatar } = body;

    // Validation des données
    const updateData: {
      name?: string;
      bio?: string | null;
      avatar?: string | null;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string") {
        return NextResponse.json(
          { error: "Le nom doit être une chaîne de caractères" },
          { status: 400 }
        );
      }
      updateData.name = name.trim() || null;
    }

    if (bio !== undefined) {
      if (bio !== null && typeof bio !== "string") {
        return NextResponse.json(
          { error: "La bio doit être une chaîne de caractères ou null" },
          { status: 400 }
        );
      }
      updateData.bio = bio === "" ? null : bio?.trim() || null;
    }

    if (avatar !== undefined) {
      if (avatar !== null && typeof avatar !== "string") {
        return NextResponse.json(
          { error: "L'avatar doit être une URL valide ou null" },
          { status: 400 }
        );
      }
      updateData.avatar = avatar === "" ? null : avatar?.trim() || null;
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}

