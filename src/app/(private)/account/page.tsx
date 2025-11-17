import { auth } from "../../../../auth";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await auth();

  // Si l'utilisateur n'est pas authentifié, rediriger vers /signin
  if (!session) {
    redirect("/signin?callbackUrl=/account");
  }

  // Rediriger vers la page de profil utilisateur
  if (session.user?.id) {
    redirect(`/users/${session.user.id}`);
  }

  return (
    <div>
      <h1>Account page</h1>
      <p>Bienvenue, {session.user?.email}</p>
    </div>
  );
}
