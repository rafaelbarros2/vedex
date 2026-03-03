import { KeycloakConfig } from 'keycloak-js';
import { environment } from '../../../environments/environment';

export const keycloakConfig: KeycloakConfig = {
  url: environment.keycloakUrl,
  realm: 'vendex-master',
  clientId: 'vedex-frontend'
};

/**
 * Opções de inicialização do Keycloak
 */
export const keycloakInitOptions = {
  // Método de autenticação (check-sso = verifica se já está logado sem redirecionar)
  onLoad: 'check-sso' as const,

  // Habilita PKCE (Proof Key for Code Exchange) - mais seguro para SPAs
  pkceMethod: 'S256' as const,

  // Redireciona para esta URL após login — usa href para preservar a rota atual
  // (window.location.origin causava redirect para / depois do check-sso, ignorando a rota)
  redirectUri: window.location.href,

  // Redireciona para esta URL após logout
  postLogoutRedirectUri: window.location.origin,

  // Desabilita iframe (SSO puro com redirecionamento)
  checkLoginIframe: false
};

/**
 * URLs permitidas para adicionar token automaticamente
 * O interceptor vai adicionar o token JWT apenas para estas URLs
 */
export const bearerExcludedUrls: string[] = [
  '/assets',
  '/api/auth/config',
  '/api/auth/health'
];

