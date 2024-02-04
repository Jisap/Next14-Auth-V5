"use server"

import { RegisterSchema } from "@/schemas"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { getUserByEmail } from "@/data/user"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  
  const validatedFields = RegisterSchema.safeParse(values);

  if(!validatedFields.success){
    return { error: "Invalid fields"}
  }

  const { email, password, name } = validatedFields.data;   // Datos validados del formulario
  const hashedPassword = await bcrypt.hash(password, 10);   // Encriptación de la pass

  const existingUser = await getUserByEmail(email)          // Comprobación de si existe el usuario que se quiere registrar
 
  if(existingUser){                                         // Si existe lanzamos error
    return { error: "Email already in use!" }
  }

  await db.user.create({                                    // Si no existe lo creamos
    data:{
      name,
      email,
      password: hashedPassword
    }
  });

  const verificationToken = await generateVerificationToken(email); // Generamos token de verificación.

  await sendVerificationEmail(  // Enviamos un email al usuario con un link que contiene el token -> auth/new-verificationToken
    verificationToken.email,
    verificationToken.token,
  )

  return { success: "Confirmation email sent"}
}