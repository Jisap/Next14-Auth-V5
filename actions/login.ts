"use server"

import { signIn } from "@/auth";
import { getUserByEmail } from "@/data/user";
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

  const { email, password } = validatedFields.data;                                 // Extraemos valores validados

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

  if (existingUser.isTwoFactorEnabled && existingUser.email) {                        // Si el usuario habilitó el twoFactor y existe el email

    const twoFactorToken = await generateTwoFactorToken(existingUser.email);          // Crea un nuevo objeto twoFactorToken con los nuevos datos
    await sendTwoFactorTokenEmail(                                                    // y se envía por email el token contenido dentro del este.
      twoFactorToken.email,
      twoFactorToken.token  
    );

    return { twoFactor: true } // Este objeto se usará en el frontend 
  
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