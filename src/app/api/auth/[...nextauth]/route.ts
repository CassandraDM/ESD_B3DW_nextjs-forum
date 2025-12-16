import { handlers } from "../../../../../auth";
import { NextRequest } from "next/server";

// Wrapper pour ajouter des logs de débogage
async function handleGET(request: NextRequest) {
  console.log("[NextAuth] GET request:", request.url);
  console.log("[NextAuth] Pathname:", request.nextUrl.pathname);
  try {
    const response = await handlers.GET(request);
    console.log("[NextAuth] Response status:", response.status);
    return response;
  } catch (error) {
    console.error("[NextAuth] Error in GET handler:", error);
    throw error;
  }
}

async function handlePOST(request: NextRequest) {
  console.log("[NextAuth] POST request:", request.url);
  try {
    const response = await handlers.POST(request);
    console.log("[NextAuth] Response status:", response.status);
    return response;
  } catch (error) {
    console.error("[NextAuth] Error in POST handler:", error);
    throw error;
  }
}

export const GET = handleGET;
export const POST = handlePOST;
