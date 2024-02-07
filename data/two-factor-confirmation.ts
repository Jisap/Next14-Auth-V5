import { db } from "@/lib/db";

export const getTwoFactorConfirmationByUserId = async (
  userId: string
) => {
  try {
    const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique({ // Obiene el objeto twoFactorConfirmation de la tabla según userId
      where: { userId }
    });

    return twoFactorConfirmation;
  } catch {
    return null;
  }
};