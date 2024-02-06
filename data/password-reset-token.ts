import { db } from "@/lib/db";


export const getPasswordResetTokenByToken = async (token: string) => {  // Obtiene token de la tabla de passwordResetToken según token
  try {
    const passwordResetToken = await db.passwordResetToken.findUnique({
      where: { token }
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {  // Obtiene token de la tabla de passwordResetToken segun email
  try {
    const passwordResetToken = await db.passwordResetToken.findFirst({
      where: { email }
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};

