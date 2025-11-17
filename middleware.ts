import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  console.log(
    "[Middleware] Path:",
    pathname,
    "Authenticated:",
    isAuthenticated
  );

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ["/", "/signin", "/signup", "/conversations"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Routes protégées (nécessitent une authentification)
  // - /account : Page de profil utilisateur
  // Note: Les route groups (private) ne sont pas dans l'URL, donc /account est directement accessible
  // Note: La protection des routes API (POST /api/conversations, POST /api/messages)
  // sera gérée directement dans les route handlers (voir étape 3 du README)
  const protectedRoutes = ["/account"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  console.log("[Middleware] Is protected route:", isProtectedRoute);

  // Si c'est une route protégée et que l'utilisateur n'est pas authentifié
  if (isProtectedRoute && !isAuthenticated) {
    console.log("[Middleware] Redirecting to /signin");
    // Rediriger vers la page de connexion avec callbackUrl pour revenir après connexion
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Si l'utilisateur est authentifié et essaie d'accéder à signin/signup, rediriger vers la home
  if (isAuthenticated && (pathname === "/signin" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
