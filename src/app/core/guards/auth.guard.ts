import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

/**
 * Auth Guard para proteger rotas que requerem autenticação
 *
 * Uso:
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  // Verifica se o usuário está autenticado
  const isLoggedIn = await keycloakService.isLoggedIn();

  if (!isLoggedIn) {
    // Redireciona para login do Keycloak
    await keycloakService.login({
      redirectUri: window.location.origin + state.url
    });
    return false;
  }

  // Verifica roles necessárias (se especificadas na rota)
  const requiredRoles = route.data['roles'] as Array<string>;

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role =>
      keycloakService.isUserInRole(role)
    );

    if (!hasRequiredRole) {
      // Usuário autenticado mas sem permissão
      console.error('Acesso negado: usuário não possui as roles necessárias', requiredRoles);
      return router.createUrlTree(['/403']); // Página de acesso negado
    }
  }

  return true;
};

/**
 * Guard para verificar roles específicas
 *
 * Uso:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [roleGuard],
 *   data: { roles: ['ADMIN'] }
 * }
 */
export const roleGuard = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  const isLoggedIn = await keycloakService.isLoggedIn();

  if (!isLoggedIn) {
    await keycloakService.login({
      redirectUri: window.location.origin + state.url
    });
    return false;
  }

  const requiredRoles = route.data['roles'] as Array<string>;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const hasRequiredRole = requiredRoles.some(role =>
    keycloakService.isUserInRole(role)
  );

  if (!hasRequiredRole) {
    console.error('Acesso negado:', {
      requiredRoles,
      userRoles: keycloakService.getUserRoles()
    });
    return router.createUrlTree(['/403']);
  }

  return true;
};
