import { KeycloakService } from 'keycloak-angular';
import { keycloakConfig, keycloakInitOptions } from '../config/keycloak.config';

const KEYCLOAK_INIT_TIMEOUT_MS = 5000;

/**
 * Factory function para inicializar o Keycloak.
 *
 * - Se Keycloak responder normalmente, o usuário é autenticado via SSO.
 * - Se Keycloak não estiver disponível (timeout de 5s), a app carrega no
 *   modo não-autenticado e o authGuard redireciona para /login.
 */
export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () => {
    const keycloakInit = keycloak
      .init({
        config: keycloakConfig,
        initOptions: keycloakInitOptions,

        // Não injeta token em assets e endpoints públicos
        bearerExcludedUrls: ['/assets', '/api/public'],

        shouldAddToken: (request) => {
          const { url } = request;
          if (url.includes('/assets')) return false;
          if (url.includes('/api/public') || url.includes('/api/auth/config')) return false;
          return url.includes('/api/');
        },

        // Atualiza o token quando ele está próximo de expirar (< 70 segundos)
        shouldUpdateToken: (_request) => {
          return keycloak.isTokenExpired(70);
        }
      });

    const timeout = new Promise<boolean>((_resolve, reject) =>
      setTimeout(() => reject(new Error(`Keycloak não respondeu em ${KEYCLOAK_INIT_TIMEOUT_MS / 1000}s`)), KEYCLOAK_INIT_TIMEOUT_MS)
    );

    return Promise.race([keycloakInit, timeout]).catch((error) => {
      console.warn('[Auth] Keycloak indisponível — continuando sem autenticação:', error?.message ?? error);
      return false;
    });
  };
}
