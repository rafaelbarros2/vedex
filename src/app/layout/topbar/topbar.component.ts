import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    BadgeModule,
    AvatarModule,
    MenuModule
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  private authService = inject(AuthService);

  menuToggle = output<void>();

  searchTerm = '';

  // Estado do usuário
  userInfo = this.authService.userInfo;

  // Menu do usuário
  userMenuItems = signal<MenuItem[]>([
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => this.goToProfile()
    },
    {
      label: 'Configurações',
      icon: 'pi pi-cog',
      command: () => this.goToSettings()
    },
    {
      separator: true
    },
    {
      label: 'Sair',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ]);

  onMenuToggle() {
    this.menuToggle.emit();
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

  goToProfile() {
    // Abre a página de gerenciamento de conta do Keycloak
    this.authService.manageAccount();
  }

  goToSettings() {
    // TODO: Navegar para página de configurações
    console.log('Ir para configurações');
  }

  getUserInitials(): string {
    const user = this.userInfo();
    if (!user) return 'U';

    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';

    return (firstInitial + lastInitial).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U';
  }

  getUserDisplayName(): string {
    const user = this.userInfo();
    if (!user) return 'Usuário';

    return user.fullName || user.username || 'Usuário';
  }

  getUserRole(): string {
    const user = this.userInfo();
    if (!user || !user.roles || user.roles.length === 0) return 'Usuário';

    // Mapear roles para nomes amigáveis
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrador',
      'GERENTE': 'Gerente',
      'OPERADOR': 'Operador',
      'VENDEDOR': 'Vendedor'
    };

    const primaryRole = user.roles[0];
    return roleMap[primaryRole] || primaryRole;
  }
}
