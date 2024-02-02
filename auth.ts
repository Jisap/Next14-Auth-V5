import NextAuth, { Session, User } from "next-auth"
import authConfig from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter" 
import { db } from "./lib/db"
import { getUserById } from "./data/user"
import { UserRole } from "@prisma/client"




export const { handlers: { GET, POST }, auth, signIn, signOut} = NextAuth({

  events:{
    async linkAccount({ user }) { // se dispara cuando un usuario inicia sesión y vincula su cuenta existente con otra estrategia de inicio de sesión: google o github
      await db.user.update({      // Aquí se esta actualizano la propiedad emailVerified en la base de datos cuando se vincula una cuenta.
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },

  callbacks: {  
    
    // async signIn({ user }) {
    //   const existingUser = await getUserById(user.id);
    //   if(!existingUser || !existingUser.emailVerified){
    //     return false;
    //   }
    //   return true
    // },
    
    async session({ token, session }) {  // La session se configura con el token creado despues del signIn
      console.log({
        sessionToken: token
      })
      if(token.sub && session.user){ 
        session.user.id = token.sub                       // definimos el user de la session con el del token. 
      }
      if( token.role && session.user){   
        session.user.role = token.role as UserRole;       // definimos el user.role de la session con el del token 
      }
      return session
    },
    
    async jwt({ token }) {               // Tras efectuar un signIn se crea un token jwt
      
      if(!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if(!existingUser) return token;

      token.role = existingUser.role; // Introducimos en el token la prop del role

      return token
    }
  },
  adapter: PrismaAdapter(db),   // bd que se va a utilizar
  session: { strategy: "jwt" }, // estrategía de autenticación
  ...authConfig,                // proveedor de autenticación    
})