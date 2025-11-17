import UserProfile from "@/components/app/user/UserProfile";
import { notFound } from "next/navigation";
import Header from "@/components/app/common/Header";

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

async function getUserData(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/users/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch user");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { id } = await params;
  const user = await getUserData(id);

  if (!user) {
    notFound();
  }

  return (
    <>
      <Header />
      <UserProfile user={user} />
    </>
  );
}

