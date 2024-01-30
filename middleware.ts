import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig)


export default auth((req) => {

  const isLoggedIn = !!req.auth;

  console.log("ROUTE:",  req.nextUrl.pathname);
  console.log("IS LOGGEDIN", isLoggedIn);
})

// Todas las rutas que coincidan con el matcher pasaran por auth, con excepción de los archivos estáticos de next
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}