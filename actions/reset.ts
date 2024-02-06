"use server"

import * as z from "zod";
import { getUserByEmail } from "@/data/user";
import { ResetSchema } from "@/schemas";
import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/tokens";

export const reset = async(values: z.infer<typeof ResetSchema>) => {

  const validatedFields = ResetSchema.safeParse(values);

  if(!validatedFields.success){
    return {error: "Invalid email"}
  }

  const { email } = validatedFields.data;

  const exisitingUser = await getUserByEmail(email);

  if(!exisitingUser){
    return {error: "Email not found!"}
  }

  const passwordResetToken = await generatePasswordResetToken(email); // Crea una nueva entrada en la tabla con el token renovado
  await sendPasswordResetEmail(                                       // Se envia un email -> link -> auth/new-password
    passwordResetToken.email,
    passwordResetToken.token,
  );

  return { success: "Reset email sent"}
}

