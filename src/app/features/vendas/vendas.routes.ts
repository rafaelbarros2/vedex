import { Routes } from '@angular/router';

export const vendasRoutes: Routes = [
  {
    path: '',
    redirectTo: 'historico',
    pathMatch: 'full'
  },
  {
    path: 'historico',
    loadComponent: () =>
      import('./pages/vendas-list/vendas-list.component').then(c => c.VendasListComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/venda-detalhe/venda-detalhe.component').then(c => c.VendaDetalheComponent)
  }
];
