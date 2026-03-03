import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

/**
 * Guard que protege rotas que requerem autenticação.
 *
 * Fluxo:
 * 1. Verifica se o usuário está logado no Keycloak
 * 2. Se não estiver, tenta redirecionar para o login do Keycloak
 * 3. Se o Keycloak estiver indisponível, redireciona para /login (tela local)
 * 4. Verifica roles necessárias (se definidas em route.data['roles'])
 *
 * Uso:
 * { path: 'dashboard', ..., canActivate: [authGuard] }
 *
 * Com roles:
 * { path: 'admin', ..., canActivate: [authGuard], data: { roles: ['ADMIN'] } }
 */
export const authGuard = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  try {
    const isLoggedIn = await keycloakService.isLoggedIn();

    if (!isLoggedIn) {
      // Redireciona para a tela de login local, preservando a URL de destino
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Verifica roles necessárias (se especificadas na rota)
    const requiredRoles = route.data['roles'] as string[] | undefined;

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => keycloakService.isUserInRole(role));

      if (!hasRequiredRole) {
        console.warn('[AuthGuard] Acesso negado — roles necessárias:', requiredRoles);
        return router.createUrlTree(['/403']);
      }
    }

    return true;
  } catch (error) {
    // Keycloak indisponível — redireciona para a tela de login local
    console.warn('[AuthGuard] Keycloak indisponível, redirecionando para /login:', error);
    return router.createUrlTree(['/login']);
  }
};

/**
 * Guard para verificar roles específicas (alias semântico do authGuard).
 */
export const roleGuard = authGuard;
