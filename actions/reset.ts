"use server"

import * as z from "zod";
import { getUserByEmail } from "@/data/user";
import { ResetSchema } from "@/schemas";

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

  // TODO: Generate token & send email

  return { success: "Reset email sent"}
}

