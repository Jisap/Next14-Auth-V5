import { getVerificationTokenByEmail } from '@/data/verification-token';
import { v4 as uuidv4 } from 'uuid'
import { db } from './db';
import { getPasswordResetTokenByEmail } from '@/data/password-reset-token';
import crypto from 'crypto'
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token';

export const generateTwoFactorToken = async (email: string) => {

  const token = crypto.randomInt(100_000, 1_000_000).toString();    // Crea token
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);   // Crea fecha de expiración

  const existingToken = await getTwoFactorTokenByEmail(email);      // Busca el objeto twoFactorToken en su table según email

  if (existingToken) {                                              // Si existe lo borra
    await db.twoFactorToken.delete({
      where: {
        id: existingToken.id,
      }
    });
  }

  const twoFactorToken = await db.twoFactorToken.create({           // Crea un nuevo objeto twoFactorToken con los nuevos datos
    data: {
      email,
      token,
      expires,
    }
  });

  return twoFactorToken;
}

export const generateVerificationToken = async (email:string) => {

  const token = uuidv4();                                           // Nuevo token
  const expires = new Date(new Date().getTime() + 3600 * 1000);     // 1 hora
  const existingToken = await getVerificationTokenByEmail(email);   // Verificamos si existe el token

  if(existingToken){                                                // Si existe lo borramos
    await db.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const verificationToken = await db.verificationToken.create({     // Crea una nueva entrada en la tabla con el token renovado
    data: {
      email,
      token,
      expires
    }
  })

  return verificationToken;
};

export const generatePasswordResetToken = async (email: string) => {
  
  const token = uuidv4();                                           // Nuevo token
  const expires = new Date(new Date().getTime() + 3600 * 1000);     // 1 hora

  const existingToken = await getPasswordResetTokenByEmail(email);  // Obtiene el token existente

  if (existingToken) {
    await db.passwordResetToken.delete({                            // Lo borra
      where: { id: existingToken.id }
    });
  }

  const passwordResetToken = await db.passwordResetToken.create({   // Crea una nueva entrada en la tabla con el token renovado
    data: {
      email,
      token,
      expires
    }
  });

  return passwordResetToken;
}