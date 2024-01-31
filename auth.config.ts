
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { LoginSchema } from "./schemas"
import { getUserByEmail } from "./data/user";
import bcrypt from 'bcrypt';



export default {
  providers: [
    Credentials({
      async authorize(credentials){

        const validatedFields = LoginSchema.safeParse(credentials); // Campos del formulario según schema
        
        if(validatedFields.success){                                // Si fueron validados con éxito
          const { email, password } = validatedFields.data;         // los desestructuramos
          
          const user = await getUserByEmail(email);                 // Buscamos el usuario en bd
          if(!user || !user.password) return null;                  // Si no existe en bd el user o la pass return null

          const passwordMatch = await bcrypt.compare(               // Si si existen comparamos la pass del formulario 
            password,                                               // con la pass del user de la bd
            user.password  
          );

          if(passwordMatch) return user;                            // Si la pass es coicidente devolvemos el user
        }

        return null;                                                // Si no null.
      }
    })
  ],
} satisfies NextAuthConfig