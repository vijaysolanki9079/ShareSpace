import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.type = user.type;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.type =
          token.type === "ngo" ? "ngo" : token.type === "user" ? "user" : "user";
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
