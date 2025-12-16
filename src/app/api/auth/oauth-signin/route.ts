import { NextRequest, NextResponse } from "next/server";
import { signIn } from "../../../../../auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, callbackUrl } = body;

    if (!provider) {
      return NextResponse.json({ error: "Provider requis" }, { status: 400 });
    }

    // Déclencher le OAuth flow avec NextAuth
    const result = await signIn(provider, {
      redirectTo: callbackUrl || "/",
      redirect: false,
    });

    // Si result contient une URL de redirection, la renvoyer
    if (result) {
      return NextResponse.json({ url: result }, { status: 200 });
    }

    return NextResponse.json(
      { error: "Erreur lors de l'initialisation OAuth" },
      { status: 500 }
    );
  } catch (error) {
    console.error("[OAuth] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la connexion OAuth" },
      { status: 500 }
    );
  }
}
