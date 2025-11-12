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
    const response = await fetch("/api/auth/session");
    if (!response.ok) {
      return { user: { id: "", email: "" }, authenticated: false };
    }
    const data = await response.json();
    return data.session || { user: { id: "", email: "" }, authenticated: false };
  } catch (error) {
    console.error("Error fetching session:", error);
    return { user: { id: "", email: "" }, authenticated: false };
  }
}

export function useSession() {
  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    session: data,
    isLoading,
    isAuthenticated: data?.authenticated ?? false,
  };
}

