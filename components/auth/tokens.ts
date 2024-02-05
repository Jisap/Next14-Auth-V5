import { getVerificationTokenByEmail } from '@/data/verification-token';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid'

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

  const verificationToken = await db.verificationToken.create({     // Creamos uno nuevo
    data: {
      email,
      token,
      expires
    }
  })

  return verificationToken;
}