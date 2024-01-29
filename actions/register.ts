"use server"

import { RegisterSchema } from "@/schemas"
import { z } from "zod"
import bcrypt from "bcrypt"
import { db } from "@/lib/db"
import { getUserByEmail } from "@/data/user"

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

  // TODO: Send verification token email

  return { success: "Email created"}
}