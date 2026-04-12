/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password");
        }

        try {
          // Try to find user in User table
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (user && (await bcrypt.compare(credentials.password, user.password))) {
            return {
              id: user.id,
              email: user.email,
              name: user.fullName,
              type: "user",
            };
          }

          // Try to find user in NGO table
          const ngo = await prisma.nGO.findUnique({
            where: { email: credentials.email },
          });

          if (ngo && (await bcrypt.compare(credentials.password, ngo.password))) {
            return {
              id: ngo.id,
              email: ngo.email,
              name: ngo.organizationName,
              type: "ngo",
            };
          }

          throw new Error("Invalid email or password");
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user?.email) return false;

        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                fullName: user.name || "Google User",
                password: "", // Empty for OAuth users
                image: user.image,
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error during Google sign-in:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
        if (session.bio !== undefined) token.bio = session.bio;
        if (session.location !== undefined) token.location = session.location;
      }

      // On initial sign in
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.type = "user";
          token.name = dbUser.fullName;
          token.picture = dbUser.image;
          token.bio = dbUser.bio;
          token.location = dbUser.location;
        }
      } else if (user) {
        // From Credentials Provider
        token.id = user.id;
        token.type = (user as any).type;
        token.name = user.name;
        token.picture = user.image;
        // Bio and location are fetched depending on type if needed, but we rely on subsequent updates.
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.type = token.type === "ngo" ? "ngo" : "user";
        if (token.name) session.user.name = token.name as string;
        if (token.picture) session.user.image = token.picture as string;
        if (token.bio !== undefined) (session.user as any).bio = token.bio;
        if (token.location !== undefined) (session.user as any).location = token.location;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login?error=true",
  },

  events: {
    async signOut() {
      // Handle sign out if needed
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
