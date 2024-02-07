import { db } from "@/lib/db";

export const getTwoFactorTokenByToken = async (token: string) => {  // Obtiene de la tabla twoFActorToken el objeto según token
  try {
    const twoFactorToken = await db.twoFactorToken.findUnique({
      where: { token }
    });

    return twoFactorToken;
  } catch {
    return null;
  }
};

export const getTwoFactorTokenByEmail = async (email: string) => {  // Obtiene de la tabla twoFactorToken el objeto según email
  try {
    const twoFactorToken = await db.twoFactorToken.findFirst({
      where: { email }
    });

    return twoFactorToken;
  } catch {
    return null;
  }
};