"use client";

import { useQuery } from "@tanstack/react-query";

interface Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
  authenticated: boolean;
}

async function fetchSession(): Promise<Session> {
  try {
    const response = await fetch("/api/auth/session", {
      credentials: "include", // Inclure les cookies pour la session
    });
    if (!response.ok) {
      return { user: { id: "", email: "" }, authenticated: false };
    }
    const data = await response.json();
    // L'API retourne { session: {...}, authenticated: true }
    // On doit retourner l'objet complet avec authenticated
    if (data.authenticated && data.session) {
      return {
        user: data.session.user,
        authenticated: data.authenticated,
      };
    }
    return { user: { id: "", email: "" }, authenticated: false };
  } catch (error) {
    console.error("Error fetching session:", error);
    return { user: { id: "", email: "" }, authenticated: false };
  }
}

export function useSession() {
  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: 0, // Toujours considérer comme stale pour permettre le refetch immédiat
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    session: data,
    isLoading,
    isAuthenticated: data?.authenticated ?? false,
  };
}
