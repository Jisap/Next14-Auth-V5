import { PrismaClient } from "@prisma/client";

declare global {                                  // global no esta afectado por el hotreload de next.js
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if(process.env.NODE_ENV !== "production") globalThis.prisma = db;