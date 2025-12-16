import { NextRequest, NextResponse } from "next/server";
import { signIn, signOut } from "../../../../../auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Nettoyer toute session existante avant de créer une nouvelle
    // pour éviter l'accumulation de cookies
    try {
      await signOut({ redirect: false });
    } catch (error) {
      // Ignorer si pas de session active
    }

    // Attempt to sign in using NextAuth
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // NextAuth v5 returns an object with error or redirect
    if (result?.error) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // If we get here, sign in was successful
    const response = NextResponse.json(
      {
        message: "Connexion réussie",
        success: true,
      },
      { status: 200 }
    );

    // Nettoyer les anciens cookies pour éviter l'accumulation
    const cookiePrefix = process.env.NODE_ENV === "production" ? "__Secure-" : "";
    const cookiesToDelete = [
      `${cookiePrefix}next-auth.csrf-token`,
      `next-auth.csrf-token`,
      `next-auth.callback-url`,
    ];
    
    cookiesToDelete.forEach((cookieName) => {
      response.cookies.delete(cookieName);
    });

    return response;
  } catch (error) {
    console.error("Error in signin:", error);
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}
