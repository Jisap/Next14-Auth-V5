"use server"

import { signIn } from "@/auth";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/lib/mail";
import { generateTwoFactorToken, generateVerificationToken } from "@/lib/tokens";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas"
import { AuthError } from "next-auth";

import { z } from "zod"

export const login = async (values: z.infer<typeof LoginSchema>) => {
  
  const validatedFields = LoginSchema.safeParse(values);                            // Values del formulario validados según schema

  if(!validatedFields.success){                                                     // Si no son válidos error
    return { error: "Invalid fields"}
  }

  const { email, password, code } = validatedFields.data;                           // Extraemos valores validados

  const existingUser = await getUserByEmail(email);                                 // Determinamos si existe el usuario en bd

  if (!existingUser || !existingUser.email || !existingUser.password) {             // Si no existe error
    
    return { error: "Email does not exist!" }
  }

  if (!existingUser.emailVerified) {                                                  // Si si existe pero no tiene emailVerified

    const verificationToken = await generateVerificationToken(existingUser.email);    // generamos token

    await sendVerificationEmail(    // Enviamos email con link que contiene el token -> auth/new-verificationToken
      verificationToken.email,
      verificationToken.token,
    );

    return { success: "Confirmation email sent!" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {                         // Si el usuario habilitó el twoFactor y existe el email
    if (code) {                                                                        // y se introdujo el código  
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email)        // se verifica 
       console.log('twoFactorToken:', twoFactorToken)
      if(!twoFactorToken){
        return{ error: "Invalid code!" }                                                           // 1º si existe
      }

      if (twoFactorToken.token !== code){                                                          // 2º si el código del formulario = twoFactor.token del objeto 
        return { error: "Invalid code!" }
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();                            // 3º si expiró el token

      if(hasExpired){
        return { error: "Code expired!"}
      }

      await db.twoFactorToken.delete({                                                             // Si paso todo lo anterior se borra de la tabla de twoFactorToken
        where: { id: twoFactorToken.id }
      })

      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);       // Comprobamos que existe la twoFactorConfirmation según user

      if(existingConfirmation){                                                                   // Si existe la borramos
        await db.twoFactorConfirmation.delete({
          where: {id: existingConfirmation.id}
        })
      }

      await db.twoFactorConfirmation.create({                                                     // Creamos la nueva twoFactorConfirmation
        data: {
          userId: existingUser.id
        }
      })
                                                                 
    } else {                                                                           // sino lo habilito 
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);         // se crea un nuevo objeto twoFactorToken con los nuevos datos
      await sendTwoFactorTokenEmail(                                                   // y se envía por email el token contenido dentro del este.
        twoFactorToken.email,
        twoFactorToken.token  
      );
      
      return { twoFactor: true } // Este objeto se usará en el frontend 
      
    }
  }

  try {

    await signIn("credentials", { 
      email, 
      password, 
      redirectTo: DEFAULT_LOGIN_REDIRECT 
    })
  
  } catch (error) {
    console.log(error)
    if(error instanceof AuthError){
      switch (error.type){
        case "CredentialsSignin":
          return { error: "Invalid credentials!"}
        default:
          return {error: "Something went wrong!"}
      }
    }

    throw error;
  }
}