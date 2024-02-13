import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth"


export type ExtendedUser = DefaultSession["user"] & { // Tipo expandido de user
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOauth: boolean;
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
