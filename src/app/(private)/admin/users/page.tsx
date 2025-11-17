import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-utils";
import UsersList from "@/components/app/admin/UsersList";
import Header from "@/components/app/common/Header";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/signin?callbackUrl=/admin/users");
  }

  // Vérifier que l'utilisateur est admin
  const userIsAdmin = await isAdmin(session.user.id);
  if (!userIsAdmin) {
    redirect("/");
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Gestion des utilisateurs</h1>
        <UsersList />
      </div>
    </>
  );
}

