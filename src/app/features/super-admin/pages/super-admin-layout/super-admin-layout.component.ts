import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-super-admin-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="super-admin-shell">
      <!-- Sidebar -->
      <aside class="sa-sidebar">
        <div class="sa-logo">
          <span class="sa-logo-icon">⚡</span>
          <div>
            <span class="sa-logo-title">VendeX</span>
            <span class="sa-logo-sub">Plataforma</span>
          </div>
        </div>
        <nav class="sa-nav">
          <a routerLink="lojas" routerLinkActive="active" class="sa-nav-item">
            <span>🏪</span> Lojas
          </a>
          <a routerLink="lojas/nova" routerLinkActive="active" class="sa-nav-item">
            <span>➕</span> Nova Loja
          </a>
        </nav>
        <div class="sa-footer">
          <span class="sa-badge">SUPER ADMIN</span>
        </div>
      </aside>

      <!-- Conteúdo -->
      <main class="sa-content">
        <router-outlet />
      </main>
    </div>
  `,
    styles: [`
    .super-admin-shell {
      display: flex;
      min-height: 100vh;
      background: #0f0f13;
      font-family: 'Inter', sans-serif;
    }
    .sa-sidebar {
      width: 240px;
      background: #16161f;
      border-right: 1px solid #2a2a3a;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      gap: 2rem;
    }
    .sa-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
    }
    .sa-logo-icon {
      font-size: 1.8rem;
    }
    .sa-logo-title {
      display: block;
      font-weight: 700;
      font-size: 1.1rem;
      color: #e2e2f0;
    }
    .sa-logo-sub {
      display: block;
      font-size: 0.7rem;
      color: #f59e0b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
    }
    .sa-nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
    }
    .sa-nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.75rem;
      border-radius: 8px;
      color: #8888aa;
      text-decoration: none;
      font-size: 0.9rem;
      transition: all 0.15s;
    }
    .sa-nav-item:hover,
    .sa-nav-item.active {
      background: #23233b;
      color: #ffffff;
    }
    .sa-nav-item.active {
      color: #818cf8;
    }
    .sa-footer {
      padding: 0.5rem;
    }
    .sa-badge {
      background: linear-gradient(135deg, #f59e0b, #ef4444);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 0.3rem 0.75rem;
      border-radius: 20px;
    }
    .sa-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }
  `]
})
export class SuperAdminLayoutComponent { }
