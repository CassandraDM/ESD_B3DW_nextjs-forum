import { auth } from "../../../../auth";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await auth();

  // Si l'utilisateur n'est pas authentifié, rediriger vers /signin
  if (!session) {
    redirect("/signin?callbackUrl=/account");
  }

  return (
    <div>
      <h1>Account page</h1>
      <p>Bienvenue, {session.user?.email}</p>
    </div>
  );
}
