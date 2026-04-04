import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
          const userResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/validate-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (userResponse.ok) {
            const user = await userResponse.json();
            return {
              id: user.id,
              email: user.email,
              name: user.fullName,
              type: "user",
            };
          }

          // Try to find user in NGO table
          const ngoResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/validate-ngo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (ngoResponse.ok) {
            const ngo = await ngoResponse.json();
            return {
              id: ngo.id,
              email: ngo.email,
              name: ngo.organizationName,
              type: "ngo",
            };
          }

          throw new Error("Invalid email or password");
        } catch {
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
