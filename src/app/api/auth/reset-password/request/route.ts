import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "L'email est requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
    // On retourne toujours un succès même si l'utilisateur n'existe pas
    if (!user) {
      return NextResponse.json(
        {
          message:
            "Si cet email existe dans notre système, vous recevrez un email de réinitialisation.",
        },
        { status: 200 }
      );
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Valide pendant 1 heure

    // Sauvegarder le token dans la base de données
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry,
        },
      });
    } catch (dbError: any) {
      console.error("Error updating user with reset token:", dbError);
      // Si les champs n'existent pas dans la base de données, on doit exécuter la migration
      if (dbError.code === "P2025" || dbError.message?.includes("Unknown arg")) {
        return NextResponse.json(
          {
            error:
              "Les champs de réinitialisation ne sont pas disponibles. Veuillez exécuter la migration Prisma.",
          },
          { status: 500 }
        );
      }
      throw dbError;
    }

    // Envoyer l'email de réinitialisation
    try {
      const emailResult = await sendPasswordResetEmail(user.email, resetToken);
      console.log("Email envoyé avec succès:", emailResult);
    } catch (emailError: any) {
      console.error("Error sending reset email:", emailError);
      // En mode développement, on peut logger le lien directement
      if (!process.env.RESEND_API_KEY) {
        console.log("🔗 MODE DÉVELOPPEMENT - Lien de réinitialisation:");
        console.log(
          `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password/${resetToken}`
        );
      }
      // Ne pas révéler l'erreur à l'utilisateur pour des raisons de sécurité
      // Mais on retourne quand même un succès pour ne pas révéler si l'email existe
      return NextResponse.json(
        {
          message:
            "Si cet email existe dans notre système, vous recevrez un email de réinitialisation.",
          // En mode développement, on peut retourner le lien dans la réponse
          ...(process.env.NODE_ENV === "development" &&
            !process.env.RESEND_API_KEY && {
              devResetLink: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password/${resetToken}`,
            }),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Si cet email existe dans notre système, vous recevrez un email de réinitialisation.",
        // En mode développement sans Resend, retourner le lien
        ...(process.env.NODE_ENV === "development" &&
          !process.env.RESEND_API_KEY && {
            devResetLink: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password/${resetToken}`,
          }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in reset password request:", error);
    return NextResponse.json(
      { error: "Erreur lors de la demande de réinitialisation" },
      { status: 500 }
    );
  }
}

