import { NextResponse } from "next/server";
import { signOut } from "../../../../../auth";

export async function POST() {
  try {
    await signOut({ redirect: false });

    return NextResponse.json(
      {
        message: "Déconnexion réussie",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in signout:", error);
    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}
