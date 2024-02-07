import { db } from "@/lib/db";

export const getTwoFactorConfirmationByUserId = async ( // Obiene el objeto twoFactorConfirmation de la tabla según userId
  userId: string
) => {
  try {
    const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique({ 
      where: { userId }
    });

    return twoFactorConfirmation;
  } catch {
    return null;
  }
};