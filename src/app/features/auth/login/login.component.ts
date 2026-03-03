import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    MessageModule,
    DividerModule
  ],
  templateUrl: './login.component.html',
  styles: [`
    :host {
      display: block;
      height: 100vh;
      background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%);
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  currentYear = new Date().getFullYear();

  async login() {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.login();
      // Keycloak redireciona de volta para o app após autenticação
    } catch (err) {
      console.error('[Login] Erro ao iniciar sessão:', err);
      this.error.set('Não foi possível conectar ao servidor de autenticação. Verifique se o Keycloak está disponível.');
      this.loading.set(false);
    }
  }
}
