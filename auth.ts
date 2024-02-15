import NextAuth, { Session, User } from "next-auth"
import authConfig from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter" 
import { db } from "./lib/db"
import { getUserById } from "./data/user"
import { UserRole } from "@prisma/client"
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation"
import { getAccountByUserId } from "./data/account"




export const { handlers: { GET, POST }, auth, signIn, signOut, update } = NextAuth({

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

    async signIn({ user, account }){
      
      if (account?.provider !== "credentials") return true;   // Permite OAuth login sin email verification

      const existingUser = await getUserById(user.id);

      if (!existingUser?.emailVerified) return false;         // No permite signIn sin email verification

      if (existingUser.isTwoFactorEnabled) {                  // Si esta habilitado el twoFactor se habrá creado el objeto twoFactorConfirmation según la action login
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);  // Lo obtenemos

        if (!twoFactorConfirmation) return false;             // Sino existe false y paramos el login

        await db.twoFactorConfirmation.delete({               // Si si existe borramos el objeto para los próximo signIn
          where: { id: twoFactorConfirmation.id }
        });
      }

      return true
    },
    
    async session({ token, session }) {  // La session se configura con el token creado despues del signIn, o despues de su aceso o actualización
      
      if(token.sub && session.user){ 
        session.user.id = token.sub                       // definimos el user de la session con el del token. 
      }
      if( token.role && session.user){   
        session.user.role = token.role as UserRole;       // definimos el user.role de la session con el del token 
      }
      if( session.user ){
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if(session.user){
        session.user.name = token.name;                    // Si hay cambios en el token por actualización de name o email
        session.user.email = token.email;                  // actualizamos la session con dichos name o email 
        session.user.isOauth = token.isOauth as boolean;   // También se actualiza la prop isOauth si se logeo con google o github 
      }

      return session
    },
    
    async jwt({ token }) {    // Tras efectuar un signIn se crea un token jwt. también se accede a este punto cada vez que se accede o actualiza la session
      
      if(!token.sub) return token;

      const existingUser = await getUserById(token.sub);            // Obtenemos el usuario de la bd

      if(!existingUser) return token;

      const existingAccount = await getAccountByUserId( existingUser.id )

      token.isOauth= !!existingAccount                              // Introducimos en el token la prop isOauth si existe la cuenta de google o github
      token.name = existingUser.name                                // Introducimos en el token la prop del name del signIn o de la actualización en bd realizada en settings   
      token.email = existingUser.email                              // Idem email
      token.role = existingUser.role;                               // Introducimos en el token la prop del role
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled    // introducimos en el token la prop del isTwoFactorEnabled

      return token
    }
  },
  adapter: PrismaAdapter(db),   // bd que se va a utilizar
  session: { strategy: "jwt" }, // estrategía de autenticación
  ...authConfig,                // proveedor de autenticación    
})