import { Resend } from "resend";

// Initialiser Resend seulement si la clé API est disponible
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  if (!resend) {
    console.warn(
      "RESEND_API_KEY n'est pas configuré. L'email ne sera pas envoyé."
    );
    // En développement, on peut juste logger l'URL
    const resetUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/reset-password/${resetToken}`;
    console.log("🔗 Lien de réinitialisation (dev):", resetUrl);
    return { id: "dev-mode" };
  }

  const resetUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/reset-password/${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Réinitialisation de mot de passe</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
              <h1 style="color: #333; margin-top: 0;">Réinitialisation de mot de passe</h1>
              <p>Bonjour,</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Réinitialiser mon mot de passe</a>
              </p>
              <p>Ou copiez et collez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #666; font-size: 12px;">${resetUrl}</p>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                <strong>Important :</strong> Ce lien est valide pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              </p>
              <p style="margin-top: 20px; color: #999; font-size: 12px;">
                Si vous ne pouvez pas cliquer sur le lien, copiez et collez l'URL dans votre navigateur.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw new Error("Erreur lors de l'envoi de l'email");
    }

    return data;
  } catch (error) {
    console.error("Error in sendPasswordResetEmail:", error);
    throw error;
  }
}
