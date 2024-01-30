import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter" 
import { db } from "./lib/db"

export const { handlers: { GET, POST }, auth,} = NextAuth({
  adapter: PrismaAdapter(db),   // bd que se va a utilizar
  session: { strategy: "jwt" }, // estrategía de autenticación
  ...authConfig,                // proveedor de autenticación    
})