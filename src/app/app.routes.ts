import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  // PDV - Sem layout (fullscreen) - Requer autenticação
  {
    path: 'pdv',
    loadChildren: () => import('./features/pdv/pdv.routes').then(r => r.pdvRoutes),
    canActivate: [authGuard]
  },
  // Todas as outras rotas usam layout (sidebar + topbar) - Requer autenticação
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'produtos',
        loadChildren: () => import('./features/produtos/produtos.routes').then(r => r.produtosRoutes)
      },
      {
        path: 'categorias',
        loadChildren: () => import('./features/produtos/produtos.routes').then(r => r.categoriasRoutes)
      },
      // Vendas
      {
        path: 'vendas',
        children: [
          { path: 'nova', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
          { path: 'historico', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
          { path: 'relatorios', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
          { path: 'devolucoes', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) }
        ]
      },
      // Outras rotas
      { path: 'clientes', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'cupons', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      {
        path: 'estoque',
        loadChildren: () => import('./features/estoque/estoque.routes').then(r => r.estoqueRoutes)
      },
      {
        path: 'caixa',
        loadChildren: () => import('./features/caixa/caixa.routes').then(r => r.caixaRoutes)
      },
      { path: 'fornecedores', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'compras', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      // Financeiro
      {
        path: 'financeiro',
        children: [
          { path: 'pagar', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
          { path: 'receber', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
          { path: 'fluxo', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
          { path: 'bancos', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) }
        ]
      },
      { path: 'relatorios', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      {
        path: 'notas-fiscais',
        loadChildren: () => import('./features/notas-fiscais/notas-fiscais.routes').then(r => r.notasFiscaisRoutes)
      },
      { path: 'lojas', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      {
        path: 'usuarios',
        loadChildren: () => import('./features/usuarios/usuarios.routes').then(r => r.usuariosRoutes)
      },
      // Configurações
      {
        path: 'configuracoes',
        children: [
          { path: 'geral', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
          { path: 'pdv', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
          { path: 'fiscal', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
          { path: 'integracoes', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) }
        ]
      }
    ]
  }
];
