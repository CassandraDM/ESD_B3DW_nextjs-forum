import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { session: null, authenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        session: {
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
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
