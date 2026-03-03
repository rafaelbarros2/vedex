import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SuperAdminService, TenantSummary } from '../../services/super-admin.service';

@Component({
    selector: 'app-lojas-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="ll-container">
      <div class="ll-header">
        <div>
          <h1 class="ll-title">🏪 Lojas Cadastradas</h1>
          <p class="ll-subtitle">{{ lojas().length }} loja(s) ativa(s) na plataforma</p>
        </div>
        <a routerLink="../lojas/nova" class="ll-btn-primary">➕ Nova Loja</a>
      </div>

      @if (carregando()) {
        <div class="ll-loading">Carregando lojas...</div>
      }

      @if (!carregando() && lojas().length === 0) {
        <div class="ll-empty">
          <span>🏪</span>
          <p>Nenhuma loja cadastrada ainda.</p>
          <a routerLink="../lojas/nova" class="ll-btn-primary">Criar primeira loja</a>
        </div>
      }

      @if (lojas().length > 0) {
        <div class="ll-table-wrap">
          <table class="ll-table">
            <thead>
              <tr>
                <th>Loja</th>
                <th>Identificador</th>
                <th>CNPJ</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Expira em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (loja of lojas(); track loja.id) {
                <tr>
                  <td class="ll-nome">{{ loja.nomeFantasia }}</td>
                  <td><code>{{ loja.identificador }}</code></td>
                  <td>{{ loja.cnpj }}</td>
                  <td><span class="ll-badge ll-badge-plano">{{ loja.plano }}</span></td>
                  <td>
                    <span [class]="'ll-badge ' + statusClass(loja.status)">
                      {{ statusLabel(loja.status) }}
                    </span>
                  </td>
                  <td class="ll-data">{{ loja.dataExpiracao | date:'dd/MM/yyyy' }}</td>
                  <td class="ll-acoes">
                    @if (loja.status === 'ATIVO' || loja.status === 'TRIAL') {
                      <button class="ll-btn-warn" (click)="suspender(loja)">Suspender</button>
                    }
                    @if (loja.status === 'SUSPENSO') {
                      <button class="ll-btn-ok" (click)="ativar(loja)">Ativar</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
    styles: [`
    .ll-container { max-width: 1000px; }
    .ll-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .ll-title { font-size: 1.5rem; font-weight: 700; color: #e2e2f0; }
    .ll-subtitle { color: #666; font-size: 0.875rem; margin-top: 0.2rem; }

    .ll-btn-primary {
      background: linear-gradient(135deg, #818cf8, #6366f1);
      color: white;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .ll-loading { color: #888; padding: 2rem 0; }

    .ll-empty {
      text-align: center;
      padding: 4rem;
      color: #666;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .ll-empty span { font-size: 3rem; }

    .ll-table-wrap {
      background: #16161f;
      border: 1px solid #2a2a3a;
      border-radius: 12px;
      overflow: hidden;
    }
    .ll-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .ll-table th {
      background: #0f0f13;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.72rem;
      letter-spacing: 0.05em;
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #2a2a3a;
    }
    .ll-table td {
      padding: 0.85rem 1rem;
      color: #c0c0d8;
      border-bottom: 1px solid #1e1e2a;
    }
    .ll-table tr:last-child td { border-bottom: none; }
    .ll-table tr:hover td { background: rgba(129,140,248,0.04); }
    .ll-nome { font-weight: 600; color: #e2e2f0; }
    .ll-data { color: #666; font-size: 0.8rem; }
    .ll-acoes { display: flex; gap: 0.5rem; }

    code { color: #818cf8; font-family: monospace; font-size: 0.8rem; }

    .ll-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .ll-badge-plano { background: #23233b; color: #818cf8; }
    .badge-ativo { background: rgba(52,211,153,0.15); color: #34d399; }
    .badge-trial { background: rgba(245,158,11,0.15); color: #f59e0b; }
    .badge-suspenso { background: rgba(239,68,68,0.15); color: #f87171; }
    .badge-cancelado { background: rgba(107,114,128,0.15); color: #9ca3af; }

    .ll-btn-warn {
      background: rgba(245,158,11,0.1);
      color: #f59e0b;
      border: 1px solid rgba(245,158,11,0.3);
      padding: 0.3rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .ll-btn-ok {
      background: rgba(52,211,153,0.1);
      color: #34d399;
      border: 1px solid rgba(52,211,153,0.3);
      padding: 0.3rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
    }
  `]
})
export class LojasListComponent implements OnInit {
    private service = inject(SuperAdminService);

    lojas = signal<TenantSummary[]>([]);
    carregando = signal(true);

    ngOnInit() {
        this.service.listarLojas().subscribe({
            next: (data) => { this.lojas.set(data); this.carregando.set(false); },
            error: () => this.carregando.set(false)
        });
    }

    statusLabel(status: string): string {
        const labels: Record<string, string> = {
            ATIVO: '✅ Ativo', TRIAL: '⏳ Trial',
            SUSPENSO: '🔴 Suspenso', CANCELADO: '⛔ Cancelado'
        };
        return labels[status] || status;
    }

    statusClass(status: string): string {
        const classes: Record<string, string> = {
            ATIVO: 'badge-ativo', TRIAL: 'badge-trial',
            SUSPENSO: 'badge-suspenso', CANCELADO: 'badge-cancelado'
        };
        return classes[status] || '';
    }

    suspender(loja: TenantSummary) {
        if (!confirm(`Suspender "${loja.nomeFantasia}"? A loja ficará inacessível.`)) return;
        this.service.suspenderLoja(loja.id).subscribe(() => {
            this.lojas.update(l => l.map(x => x.id === loja.id ? { ...x, status: 'SUSPENSO' } : x));
        });
    }

    ativar(loja: TenantSummary) {
        this.service.ativarLoja(loja.id).subscribe(() => {
            this.lojas.update(l => l.map(x => x.id === loja.id ? { ...x, status: 'ATIVO' } : x));
        });
    }
}
