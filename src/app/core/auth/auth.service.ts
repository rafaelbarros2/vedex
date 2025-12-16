import { Injectable, inject, signal, computed } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { from, Observable } from 'rxjs';

/**
 * Interface para informações do usuário autenticado
 */
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  tenantId: string | null;
  permissions: any;
}

/**
 * Serviço de autenticação que encapsula o KeycloakService
 * Fornece uma interface mais simples e reativa para uso nos componentes
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloak = inject(KeycloakService);

  // Estado reativo
  private userProfile = signal<KeycloakProfile | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);

  // Computed values
  userInfo = computed<UserInfo | null>(() => {
    const profile = this.userProfile();
    if (!profile) return null;

    const token = this.getDecodedToken();

    return {
      id: profile.id || '',
      username: profile.username || '',
      email: profile.email || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
      roles: this.getRoles(),
      tenantId: token?.tenant_id || null,
      permissions: token?.permissions || null
    };
  });

  isAuthenticated = computed(() => this.isAuthenticatedSignal());

  constructor() {
    this.initializeAuthState();
  }

  /**
   * Inicializa o estado de autenticação
   */
  private async initializeAuthState() {
    try {
      const isLoggedIn = await this.keycloak.isLoggedIn();
      this.isAuthenticatedSignal.set(isLoggedIn);

      if (isLoggedIn) {
        const profile = await this.keycloak.loadUserProfile();
        this.userProfile.set(profile);
      }
    } catch (error) {
      console.error('Erro ao inicializar estado de autenticação:', error);
      this.isAuthenticatedSignal.set(false);
      this.userProfile.set(null);
    }
  }

  /**
   * Faz login redirecionando para o Keycloak
   */
  login(): Observable<void> {
    return from(this.keycloak.login());
  }

  /**
   * Faz logout
   */
  logout(): Observable<void> {
    return from(this.keycloak.logout(window.location.origin));
  }

  /**
   * Obtém o token de acesso
   */
  async getToken(): Promise<string> {
    return this.keycloak.getToken();
  }

  /**
   * Verifica se o token está expirado
   */
  isTokenExpired(minValidity: number = 0): boolean {
    return this.keycloak.isTokenExpired(minValidity);
  }

  /**
   * Atualiza o token
   */
  updateToken(minValidity: number = 70): Observable<boolean> {
    return from(this.keycloak.updateToken(minValidity));
  }

  /**
   * Obtém as roles do usuário
   */
  getRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  /**
   * Verifica se o usuário possui uma role específica
   */
  hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }

  /**
   * Verifica se o usuário possui qualquer uma das roles especificadas
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Verifica se o usuário possui todas as roles especificadas
   */
  hasAllRoles(roles: string[]): boolean {
    return roles.every(role => this.hasRole(role));
  }

  /**
   * Obtém o perfil do usuário
   */
  async getUserProfile(): Promise<KeycloakProfile | null> {
    try {
      if (this.userProfile()) {
        return this.userProfile();
      }

      const profile = await this.keycloak.loadUserProfile();
      this.userProfile.set(profile);
      return profile;
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      return null;
    }
  }

  /**
   * Obtém o token decodificado
   */
  getDecodedToken(): any {
    try {
      return this.keycloak.getKeycloakInstance().tokenParsed;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  /**
   * Obtém o tenant ID do token
   */
  getTenantId(): string | null {
    const token = this.getDecodedToken();
    return token?.tenant_id || null;
  }

  /**
   * Obtém as permissões do token
   */
  getPermissions(): any {
    const token = this.getDecodedToken();
    return token?.permissions || null;
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  hasPermission(module: string, action: string): boolean {
    const permissions = this.getPermissions();
    if (!permissions || !permissions[module]) {
      return false;
    }
    return permissions[module].includes(action);
  }

  /**
   * Redireciona para a página de gerenciamento de conta do Keycloak
   */
  manageAccount(): void {
    this.keycloak.getKeycloakInstance().accountManagement();
  }

  /**
   * Obtém a instância do Keycloak (para casos avançados)
   */
  getKeycloakInstance() {
    return this.keycloak.getKeycloakInstance();
  }
}
