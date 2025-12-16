import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        CardModule,
        MessageModule,
        CheckboxModule
    ],
    templateUrl: './login.component.html',
    styles: [`
    :host {
      display: block;
      height: 100vh;
      background: var(--surface-ground);
    }
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
    }
  `]
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    loading = signal(false);
    error = signal<string | null>(null);

    async login() {
        this.loading.set(true);
        this.error.set(null);

        try {
            await this.authService.login();
            // Keycloak will redirect back to the app
        } catch (err) {
            console.error('Login error:', err);
            this.error.set('Erro ao iniciar sessão. Tente novamente.');
            this.loading.set(false);
        }
    }
}
