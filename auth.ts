import NextAuth, { Session, User } from "next-auth"
import authConfig from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter" 
import { db } from "./lib/db"
import { getUserById } from "./data/user"
import { UserRole } from "@prisma/client"
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation"




export const { handlers: { GET, POST }, auth, signIn, signOut} = NextAuth({

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

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

    async signIn({ user, account }){
      
      if (account?.provider !== "credentials") return true;   // Permite OAuth login sin email verification

      const existingUser = await getUserById(user.id);

      if (!existingUser?.emailVerified) return false;         // No permite signIn sin email verification

      if (existingUser.isTwoFactorEnabled) {                  // Si esta habilitado el twoFactor se habrá creado el objeto twoFactorConfirmation según esquema
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);  // Lo obtenemos

        if (!twoFactorConfirmation) return false;             // Sino existe false y paramos el login

        await db.twoFactorConfirmation.delete({               // Si si existe borramos el objeto para los próximo signIn
          where: { id: twoFactorConfirmation.id }
        });
      }

      return true
    },
    
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