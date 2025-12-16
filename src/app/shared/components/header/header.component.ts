import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, AvatarModule, MenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private authService = inject(AuthService);

  // Informações do usuário (reativo)
  userInfo = this.authService.userInfo;
  isAuthenticated = this.authService.isAuthenticated;

  // Iniciais do usuário para o avatar
  userInitials = computed(() => {
    const user = this.userInfo();
    if (!user) return '?';

    const firstInitial = user.firstName?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || user.username?.[0]?.toUpperCase() || '?';
  });

  // Menu do usuário
  userMenuItems: MenuItem[] = [
    {
      label: 'Meu Perfil',
      icon: 'pi pi-user',
      command: () => this.viewProfile()
    },
    {
      label: 'Configurações',
      icon: 'pi pi-cog',
      command: () => this.openSettings()
    },
    {
      separator: true
    },
    {
      label: 'Gerenciar Conta',
      icon: 'pi pi-id-card',
      command: () => this.manageAccount()
    },
    {
      separator: true
    },
    {
      label: 'Sair',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  viewProfile() {
    // TODO: Implementar visualização de perfil
    console.log('Ver perfil:', this.userInfo());
  }

  openSettings() {
    // TODO: Navegar para configurações
    console.log('Abrir configurações');
  }

  manageAccount() {
    // Abre página de gerenciamento de conta do Keycloak
    this.authService.manageAccount();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout realizado com sucesso');
      },
      error: (error) => {
        console.error('Erro ao fazer logout:', error);
      }
    });
  }
}