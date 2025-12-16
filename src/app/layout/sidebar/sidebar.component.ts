import { Component, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  items?: SubMenuItem[];
  expanded?: boolean;
}

interface SubMenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private authService = inject(AuthService);

  collapsed = input<boolean>(false);
  userInfo = this.authService.userInfo;

  menuItems = signal<MenuItem[]>([
    {
      label: 'Dashboard',
      icon: '📊',
      route: '/dashboard'
    },
    {
      label: 'PDV',
      icon: '🛒',
      route: '/pdv'
    },
    {
      label: 'Produtos',
      icon: '📦',
      expanded: false,
      items: [
        { label: 'Lista de Produtos', route: '/produtos' },
        { label: 'Cadastrar Produto', route: '/produtos/novo' },
        { label: 'Categorias', route: '/categorias' },
        { label: 'Nova Categoria', route: '/categorias/novo' },
        { label: 'Importar/Exportar', route: '/produtos/importar' }
      ]
    },
    {
      label: 'Estoque',
      icon: '📊',
      expanded: false,
      items: [
        { label: 'Controle de Estoque', route: '/estoque' },
        { label: 'Histórico Completo', route: '/estoque/historico' }
      ]
    },
    {
      label: 'Fluxo de Caixa',
      icon: '💵',
      expanded: false,
      items: [
        { label: 'Dashboard', route: '/caixa' },
        { label: 'Abrir Caixa', route: '/caixa/abertura' }
      ]
    },
    {
      label: 'Notas Fiscais',
      icon: '🧾',
      route: '/notas-fiscais'
    },
    {
      label: 'Usuários',
      icon: '👤',
      route: '/usuarios'
    }
  ]);

  toggleSubmenu(item: MenuItem) {
    if (item.items) {
      this.menuItems.update(items =>
        items.map(i => {
          if (i === item) {
            return { ...i, expanded: !i.expanded };
          }
          return i;
        })
      );
    }
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
}
