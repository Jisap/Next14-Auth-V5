import { getVerificationTokenByEmail } from '@/data/verification-token';
import { v4 as uuidv4 } from 'uuid'
import { db } from './db';
import { getPasswordResetTokenByEmail } from '@/data/password-reset-token';

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