"use server"

import { getUserByEmail, getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { SettingsSchema } from "@/schemas";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { update } from "@/auth";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {

  const user = await currentUser();             // Usuario logueado

  if(!user){
    return { error: "Unauthorized" }
  }

  const dbUser = await getUserById(user.id)     // Usuario en bd

  if (!dbUser) {
    return { error: "Unauthorized" }
  }

  if(user.isOauth){                             // Si el user es de google o github no se cambia nada  
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  if( values.email && values.email !== user.email) {              // Si el email introducido es distinto del logueado
    const existingUser = await getUserByEmail(values.email);      // Obtenemos el usuario de bd según email del formulario

    if(existingUser && existingUser.id !== user.id){              // Si ese usuario es distinto del logueado
      return { error: "Email already in user"}                    // significará que ese email ya esta en uso -> error
    }
  
    const verificationToken = await generateVerificationToken(    // Sino está en uso el email creamos un token de verificación
      values.email  
    );

    await sendVerificationEmail(                                  // Enviamos el correo de verificación
      verificationToken.email,
      verificationToken.token  
    );

    return { success: "Verification email sent!" }
  }

  if(values.password && values.newPassword && dbUser.password) {
    const passwordMatch = await bcrypt.compare(                   // Comparamos la pass existente con la de bd
      values.password,
      dbUser.password  
    );

    if(!passwordMatch){                                           // Si no da true -> error
      return { error: "Incorrect password"}
    }

    const hashedPassword = await bcrypt.hash(                     // Si da true nuevo hash para la nueva password
      values.newPassword,
      10,  
    );
    values.password = hashedPassword;                             // Damos el nuevo valor a la pass del formulario con la hassedPassword
    values.newPassword = undefined;
  }

  const updatedUser = await db.user.update({                      // Actualizamos bd
    where: {id: dbUser.id},
    data: {
      ...values
    }
  });

  update({                                                        // Actualizamos session -> jwt -> session
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      role: updatedUser.role, 

    }
  })

  return { success: "Settings Updated!" }


}