import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkLoginRateLimit } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        // Rate Limit Protection: Max 5 attempts per 15 minutes per email address
        const rateLimit = checkLoginRateLimit(email, 5, 15 * 60 * 1000);
        if (!rateLimit.success) {
          console.warn(`[auth] Login rate limit exceeded for email: ${email}`);
          return null;
        }

        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          // Only allow admin accounts to login via credentials
          if (!user || user.role !== "admin" || !user.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (err) {
          console.error("[auth] credentials authorize error:", err);
          return null;
        }
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      // Credentials provider: admin already verified in authorize(), just pass through
      if (account?.provider === "credentials") return true;

      // Google provider: only for owner accounts
      if (!user.email) return false;

      const googleId = account?.providerAccountId;
      if (!googleId) return false;

      const name = user.name || user.email.split("@")[0] || "Owner";

      try {
        const existing = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!existing) {
          const [inserted] = await db
            .insert(users)
            .values({
              email: user.email,
              name: name,
              googleId,
              role: "owner",
            })
            .returning();
          if (inserted) {
            user.id = inserted.id;
            (user as { role?: string }).role = "owner";
          }
        } else {
          user.id = existing.id;
          (user as { role?: string }).role = existing.role;

          if (!existing.googleId) {
            await db
              .update(users)
              .set({ googleId, updatedAt: new Date() })
              .where(eq(users.email, user.email));
          }
        }
        return true;
      } catch (err) {
        console.error("[auth] signIn DB sync error (continuing auth):", err);
        return true;
      }
    },

    async jwt({ token, user, account }) {
      // On initial sign-in via Credentials or Google, populate from user object directly
      if (user?.id) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "owner";
        return token;
      }

      // On subsequent calls, if token.id is missing, look up DB record
      if (!token.id && token.email) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, token.email),
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch (err) {
          console.error("[auth] jwt lookup error:", err);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as "owner" | "admin") ?? "owner";
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Always allow relative paths (e.g. /c/rjDva9cC)
      if (url.startsWith("/")) {
        return `${baseUrl.replace(/\/$/, "")}${url}`;
      }
      // Allow exact origin matches
      try {
        const targetUrl = new URL(url);
        if (targetUrl.origin === baseUrl.replace(/\/$/, "")) {
          return url;
        }
      } catch {
        // invalid url, fallback below
      }
      return baseUrl;
    },
  },
  pages: { signIn: "/login", error: "/login" },
});
