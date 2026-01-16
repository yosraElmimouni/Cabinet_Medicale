import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Intercepteur HTTP qui ajoute automatiquement le token d'authentification
 * dans le header Authorization de toutes les requêtes HTTP
 * 
 * Exclut automatiquement les routes d'authentification (/auth/login, /auth/register, etc.)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Exclure les routes d'authentification qui ne nécessitent pas de token
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  const isAuthRoute = authRoutes.some(route => req.url.includes(route));

  // Si c'est une route d'authentification, ne pas ajouter le token
  if (isAuthRoute) {
    return next(req);
  }

  // Récupérer le token depuis localStorage
  const token = localStorage.getItem('token');

  // Si un token existe, l'ajouter dans le header Authorization
  if (token) {
    // Cloner la requête et ajouter le header Authorization
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Passer la requête modifiée au prochain intercepteur ou au handler HTTP
    return next(clonedRequest);
  }

  // Si pas de token, passer la requête telle quelle
  return next(req);
};

