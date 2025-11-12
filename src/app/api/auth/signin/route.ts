import { NextRequest, NextResponse } from "next/server";
import { signIn } from "../../../../../auth";

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
    return NextResponse.json(
      {
        message: "Connexion réussie",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in signin:", error);
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}
