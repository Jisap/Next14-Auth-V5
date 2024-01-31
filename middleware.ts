import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes, } from "./routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;  

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if(isApiAuthRoute){ // En estas rutas de autenticación del server no se deja entrar
    return null
  };

  if(isAuthRoute){                                                        // Si entramos en una ruta que requiere autenticación (/auth/login o register)
    if(isLoggedIn){                                                       // comprobamos si el usuario está logueado 
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl)); // y si lo está redirect a /settings
    }
    return null                                                           // Si no esta logueado return null y entramos a esas rutas de logueo o register
  };

  if(!isLoggedIn && !isPublicRoute){                                      // Si el usuario no esta logueado y no es una ruta pública
    return Response.redirect(new URL("/auth/login", nextUrl));            // redirect para que loguee
  }

  return null; // null implica no hacer nada y dejar entrar en la ruta
})

// Todas las rutas que coincidan con el matcher pasaran por auth, con excepción de los archivos estáticos de next
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}