import { KeycloakService } from 'keycloak-angular';
import { keycloakConfig, keycloakInitOptions } from '../config/keycloak.config';

/**
 * Factory function para inicializar o Keycloak
 *
 * Esta função é executada ANTES da aplicação Angular iniciar
 * Garante que o usuário esteja autenticado antes de carregar a app
 */
export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () =>
    keycloak.init({
      config: keycloakConfig,
      initOptions: keycloakInitOptions,

      // Habilita modo bearer-only para APIs
      bearerExcludedUrls: ['/assets', '/api/public'],

      // Callback de sucesso
      shouldAddToken: (request) => {
        const { method, url } = request;

        // Não adiciona token para assets
        if (url.includes('/assets')) {
          return false;
        }

        // Não adiciona token para endpoints públicos
        if (url.includes('/api/public') || url.includes('/api/auth/config')) {
          return false;
        }

        // Adiciona token para todas as outras requisições à API
        return url.includes('/api/');
      },

      // Callback quando token atualiza
      shouldUpdateToken: (request) => {
        // Atualiza token se faltarem menos de 70 segundos para expirar
        return !keycloak.isTokenExpired(70);
      }
    });
}
