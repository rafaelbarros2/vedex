import { Routes } from '@angular/router';

export const financeiroRoutes: Routes = [
  {
    path: 'fluxo',
    loadComponent: () =>
      import('./pages/fluxo-caixa/fluxo-caixa.component').then(c => c.FluxoCaixaComponent)
  },
  {
    path: 'pagar',
    loadComponent: () =>
      import('./pages/contas-pagar/contas-pagar-list/contas-pagar-list.component').then(c => c.ContasPagarListComponent)
  },
  {
    path: 'pagar/nova',
    loadComponent: () =>
      import('./pages/contas-pagar/conta-pagar-form/conta-pagar-form.component').then(c => c.ContaPagarFormComponent)
  },
  {
    path: 'pagar/:id',
    loadComponent: () =>
      import('./pages/contas-pagar/conta-pagar-form/conta-pagar-form.component').then(c => c.ContaPagarFormComponent)
  },
  {
    path: 'receber',
    loadComponent: () =>
      import('./pages/contas-receber/contas-receber-list/contas-receber-list.component').then(c => c.ContasReceberListComponent)
  },
  {
    path: 'receber/nova',
    loadComponent: () =>
      import('./pages/contas-receber/conta-receber-form/conta-receber-form.component').then(c => c.ContaReceberFormComponent)
  },
  {
    path: 'receber/:id',
    loadComponent: () =>
      import('./pages/contas-receber/conta-receber-form/conta-receber-form.component').then(c => c.ContaReceberFormComponent)
  },
];
