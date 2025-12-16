import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
import crypto from "crypto";

const providers = [];

// OAuth providers (activés seulement si les variables d'environnement sont définies)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
  console.log("✅ Google OAuth provider activé");
} else {
  console.warn(
    "⚠️ Google OAuth non configuré: GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET requis"
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
  console.log("✅ GitHub OAuth provider activé");
} else {
  console.warn(
    "⚠️ GitHub OAuth non configuré: GITHUB_CLIENT_ID et GITHUB_CLIENT_SECRET requis"
  );
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  providers.push(
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    })
  );
  console.log("✅ Discord OAuth provider activé");
} else {
  console.warn(
    "⚠️ Discord OAuth non configuré: DISCORD_CLIENT_ID et DISCORD_CLIENT_SECRET requis"
  );
}

// Provider credentials (email / mot de passe)
providers.push(
  Credentials({
    name: "Credentials",
    credentials: {
      email: {
        label: "Email",
        type: "email",
        placeholder: "votre@email.com",
      },
      password: {
        label: "Mot de passe",
        type: "password",
      },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      try {
        const email = String(credentials.email).toLowerCase();

        // Find user by email
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isValid = await verifyPassword(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        // Return user object (will be stored in JWT)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      } catch (error) {
        console.error("Error in authorize:", error);
        return null;
      }
    },
  })
);

console.log(`📋 Configuration NextAuth:
  - AUTH_SECRET: ${process.env.AUTH_SECRET ? "✅ défini" : "❌ manquant"}
  - NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}
  - Nombre de providers: ${providers.length}
`);

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: "/signin",
    signOut: "/signout",
    error: "/signin", // Page d'erreur personnalisée
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET, // Spécifier explicitement le secret
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // Pour le provider credentials, on a déjà tout ce qu'il faut
      if (!account || account.provider === "credentials") {
        return true;
      }

      // OAuth: on s'assure qu'un utilisateur existe dans notre base
      if (!user.email) {
        return false;
      }

      const email = user.email.toLowerCase();

      try {
        let dbUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!dbUser) {
          // Créer un utilisateur avec un mot de passe aléatoire (non utilisé)
          const randomPassword = crypto.randomUUID();
          const hashedPassword = await hashPassword(randomPassword);

          dbUser = await prisma.user.create({
            data: {
              email,
              name: user.name,
              avatar: (user as any).image || null,
              password: hashedPassword,
              role: "USER",
            },
          });
        } else {
          // Mettre à jour éventuellement le nom / avatar
          const updatedData: any = {};
          if (!dbUser.name && user.name) {
            updatedData.name = user.name;
          }
          if (!dbUser.avatar && (user as any).image) {
            updatedData.avatar = (user as any).image;
          }

          if (Object.keys(updatedData).length > 0) {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: updatedData,
            });
          }
        }

        // Injecter l'id et le rôle dans l'objet user pour le JWT
        (user as any).id = dbUser.id;
        (user as any).role = dbUser.role;

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = (user as any).id ?? token.id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.role = (user as any).role ?? (token as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
});
