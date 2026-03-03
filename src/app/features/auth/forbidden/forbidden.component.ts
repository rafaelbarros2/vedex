import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div class="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div class="text-center max-w-md px-6">
        <div class="text-8xl mb-6">🔒</div>
        <h1 class="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3">403</h1>
        <h2 class="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-4">Acesso Negado</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8">
          Você não tem permissão para acessar esta página.
          Verifique com o administrador do sistema se você possui o perfil necessário.
        </p>
        <div class="flex gap-3 justify-center">
          <button
            pButton
            label="Ir para o Dashboard"
            icon="pi pi-home"
            (click)="irParaDashboard()"
          ></button>
          <button
            pButton
            label="Sair"
            icon="pi pi-sign-out"
            class="p-button-outlined p-button-secondary"
            (click)="logout()"
          ></button>
        </div>
        @if (userRole()) {
          <p class="text-sm text-gray-400 mt-6">
            Seu perfil atual: <span class="font-medium">{{ userRole() }}</span>
          </p>
        }
      </div>
    </div>
  `
})
export class ForbiddenComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  userRole() {
    const roles = this.authService.userInfo()?.roles;
    return roles && roles.length > 0 ? roles[0] : null;
  }

  irParaDashboard() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
