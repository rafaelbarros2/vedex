import { KeycloakConfig } from 'keycloak-js';

/**
 * Configuração do Keycloak para autenticação SSO
 *
 * IMPORTANTE: Ajuste as URLs conforme ambiente
 * - Development: http://localhost:8180
 * - Production: https://auth.vendex.com.br
 */
export const keycloakConfig: KeycloakConfig = {
  url: 'http://localhost:8180',
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

  // Redireciona para esta URL após login
  redirectUri: window.location.origin,

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

/**
 * Configuração de ambiente
 */
export const environment = {
  production: false,
  keycloak: keycloakConfig,
  apiUrl: 'http://localhost:8080/api'
};
