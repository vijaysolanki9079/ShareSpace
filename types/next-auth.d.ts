import "next-auth";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      type: "user" | "ngo";
    };
  }

  interface User {
    id: string;
    type?: "user" | "ngo";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    type?: "user" | "ngo";
  }
}
