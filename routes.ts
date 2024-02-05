/**
 * Array de rutas accesibles al público que 
 * no requieren autenticación
 * @type {string[]}
 */
export const publicRoutes =  [
  "/",
  "/auth/new-verification"
];

/**
 * Array de rutas que requieren de autenticación
 * Estas rutas redirijiran a los usuarios logueados a /settings
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error"
];

/**
 * Prefijo para las rutas API de autenticación
 * Todas las rutas que empiecen con este prefijo serán usadas con propositos de autenticación
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/** 
 * Redireccionamiento por defecto despues del logging in
 * @type {string}
*/
export const DEFAULT_LOGIN_REDIRECT = "/settings";