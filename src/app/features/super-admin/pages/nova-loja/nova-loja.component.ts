import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SuperAdminService, TenantCreateRequest, TenantSetupResponse } from '../../services/super-admin.service';

type Plano = 'BASICO' | 'PROFISSIONAL' | 'EMPRESARIAL';

@Component({
    selector: 'app-nova-loja',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="nl-container">
      <div class="nl-header">
        <h1 class="nl-title">🏪 Criar Nova Loja</h1>
        <p class="nl-subtitle">Preencha os dados para cadastrar um novo tenant no sistema.</p>
      </div>

      <!-- Formulário -->
      @if (!resultado()) {
        <form class="nl-form" (ngSubmit)="criar()" #form="ngForm">
          <div class="nl-section">
            <h2 class="nl-section-title">Dados da Loja</h2>
            <div class="nl-grid">
              <div class="nl-field">
                <label>Nome Fantasia *</label>
                <input type="text" [(ngModel)]="dados.nomeFantasia" name="nomeFantasia"
                       placeholder="Ex: Loja do João" required />
              </div>
              <div class="nl-field">
                <label>Identificador (slug) *</label>
                <input type="text" [(ngModel)]="dados.identificador" name="identificador"
                       placeholder="Ex: loja-joao" required
                       (input)="gerarSlug()" />
                <span class="nl-hint">Só letras minúsculas, números e hífens. Não pode mudar depois.</span>
              </div>
              <div class="nl-field">
                <label>CNPJ *</label>
                <input type="text" [(ngModel)]="dados.cnpj" name="cnpj"
                       placeholder="00.000.000/0001-00" required maxlength="18" />
              </div>
              <div class="nl-field">
                <label>Plano *</label>
                <select [(ngModel)]="dados.plano" name="plano" required>
                  <option value="BASICO">Básico — até 3 usuários</option>
                  <option value="PROFISSIONAL">Profissional — até 10 usuários + NF-e</option>
                  <option value="EMPRESARIAL">Empresarial — ilimitado</option>
                </select>
              </div>
            </div>
          </div>

          <div class="nl-section">
            <h2 class="nl-section-title">Acesso do Administrador da Loja</h2>
            <div class="nl-grid">
              <div class="nl-field nl-full">
                <label>Email do Admin *</label>
                <input type="email" [(ngModel)]="dados.emailAdmin" name="emailAdmin"
                       placeholder="admin@loja.com" required />
                <span class="nl-hint">Este email será o login do administrador da loja.</span>
              </div>
              <div class="nl-field">
                <label>Senha Inicial *</label>
                <input type="password" [(ngModel)]="dados.senhaAdmin" name="senhaAdmin"
                       placeholder="Mínimo 8 caracteres" required minlength="8" />
              </div>
              <div class="nl-field">
                <label>Confirmar Senha *</label>
                <input type="password" [(ngModel)]="confirmaSenha" name="confirmaSenha"
                       placeholder="Repita a senha" required />
              </div>
            </div>
          </div>

          @if (erro()) {
            <div class="nl-alert nl-alert-error">⚠️ {{ erro() }}</div>
          }

          <div class="nl-actions">
            <button type="button" class="nl-btn-secondary" [routerLink]="['../lojas']">
              Cancelar
            </button>
            <button type="submit" class="nl-btn-primary" [disabled]="loading()">
              @if (loading()) {
                <span class="nl-spinner"></span> Criando loja...
              } @else {
                🚀 Criar Loja
              }
            </button>
          </div>
        </form>
      }

      <!-- Sucesso -->
      @if (resultado()) {
        <div class="nl-success">
          <div class="nl-success-icon">🎉</div>
          <h2>Loja criada com sucesso!</h2>
          <div class="nl-success-grid">
            <div class="nl-info-card">
              <span class="nl-info-label">Identificador</span>
              <code>{{ resultado()!.identificador }}</code>
            </div>
            <div class="nl-info-card">
              <span class="nl-info-label">Plano</span>
              <span>{{ resultado()!.plano }}</span>
            </div>
            <div class="nl-info-card">
              <span class="nl-info-label">Schema PostgreSQL</span>
              <code>{{ resultado()!.schemaNome }}</code>
            </div>
            <div class="nl-info-card">
              <span class="nl-info-label">Status Keycloak</span>
              <span [class]="resultado()!.keycloakRealmCriado ? 'nl-ok' : 'nl-warn'">
                {{ resultado()!.keycloakRealmCriado ? '✅ Usuário criado' : '⚠️ Não configurado' }}
              </span>
            </div>
            <div class="nl-info-card nl-full">
              <span class="nl-info-label">Email do Admin</span>
              <span>{{ resultado()!.usuarioAdminEmail }}</span>
            </div>
          </div>
          <p class="nl-msg">{{ resultado()!.mensagem }}</p>
          <div class="nl-actions">
            <button class="nl-btn-secondary" (click)="novaCriacao()">Criar outra loja</button>
            <button class="nl-btn-primary" [routerLink]="['../lojas']">Ver todas as lojas</button>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .nl-container {
      max-width: 780px;
    }
    .nl-header { margin-bottom: 2rem; }
    .nl-title { font-size: 1.6rem; font-weight: 700; color: #e2e2f0; }
    .nl-subtitle { color: #888; margin-top: 0.25rem; font-size: 0.9rem; }

    .nl-form { display: flex; flex-direction: column; gap: 2rem; }
    .nl-section {
      background: #16161f;
      border: 1px solid #2a2a3a;
      border-radius: 12px;
      padding: 1.5rem;
    }
    .nl-section-title {
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #818cf8;
      margin-bottom: 1.25rem;
    }
    .nl-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .nl-field { display: flex; flex-direction: column; gap: 0.4rem; }
    .nl-full { grid-column: 1 / -1; }
    .nl-field label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #aaa;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .nl-field input, .nl-field select {
      background: #0f0f13;
      border: 1px solid #2a2a3a;
      border-radius: 8px;
      color: #e2e2f0;
      padding: 0.6rem 0.9rem;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.15s;
    }
    .nl-field input:focus, .nl-field select:focus { border-color: #818cf8; }
    .nl-field select option { background: #16161f; }
    .nl-hint { font-size: 0.75rem; color: #666; }

    .nl-alert { padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.875rem; }
    .nl-alert-error { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }

    .nl-actions { display: flex; gap: 1rem; justify-content: flex-end; }
    .nl-btn-primary {
      background: linear-gradient(135deg, #818cf8, #6366f1);
      color: white;
      border: none;
      padding: 0.75rem 1.75rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: opacity 0.15s;
    }
    .nl-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .nl-btn-secondary {
      background: transparent;
      color: #888;
      border: 1px solid #2a2a3a;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .nl-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .nl-success {
      background: #16161f;
      border: 1px solid #2a2a3a;
      border-radius: 12px;
      padding: 2.5rem;
      text-align: center;
    }
    .nl-success-icon { font-size: 3rem; margin-bottom: 1rem; }
    .nl-success h2 { color: #e2e2f0; margin-bottom: 1.5rem; }
    .nl-success-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      text-align: left;
    }
    .nl-info-card {
      background: #0f0f13;
      border: 1px solid #2a2a3a;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .nl-info-label { font-size: 0.7rem; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
    .nl-info-card code { color: #818cf8; font-family: monospace; font-size: 0.85rem; }
    .nl-info-card span { color: #e2e2f0; font-size: 0.875rem; }
    .nl-ok { color: #34d399 !important; }
    .nl-warn { color: #f59e0b !important; }
    .nl-msg { color: #888; font-size: 0.85rem; margin-bottom: 1.5rem; }
  `]
})
export class NovaLojaComponent {
    private superAdminService = inject(SuperAdminService);
    private router = inject(Router);

    loading = signal(false);
    erro = signal<string | null>(null);
    resultado = signal<TenantSetupResponse | null>(null);
    confirmaSenha = '';

    dados: TenantCreateRequest = {
        identificador: '',
        nomeFantasia: '',
        cnpj: '',
        plano: 'BASICO',
        emailAdmin: '',
        senhaAdmin: ''
    };

    gerarSlug() {
        this.dados.identificador = this.dados.nomeFantasia
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    criar() {
        this.erro.set(null);

        if (this.dados.senhaAdmin !== this.confirmaSenha) {
            this.erro.set('As senhas não coincidem.');
            return;
        }

        if (this.dados.senhaAdmin.length < 8) {
            this.erro.set('A senha deve ter no mínimo 8 caracteres.');
            return;
        }

        this.loading.set(true);
        this.superAdminService.criarLoja(this.dados).subscribe({
            next: (res) => {
                this.resultado.set(res);
                this.loading.set(false);
            },
            error: (err) => {
                const msg = err.error?.message || err.error?.erro || 'Erro ao criar loja. Tente novamente.';
                this.erro.set(msg);
                this.loading.set(false);
            }
        });
    }

    novaCriacao() {
        this.resultado.set(null);
        this.dados = {
            identificador: '',
            nomeFantasia: '',
            cnpj: '',
            plano: 'BASICO',
            emailAdmin: '',
            senhaAdmin: ''
        };
        this.confirmaSenha = '';
    }
}
