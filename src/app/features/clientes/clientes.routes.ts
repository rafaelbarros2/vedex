import { Routes } from '@angular/router';

export const clientesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/clientes-list/clientes-list.component').then(c => c.ClientesListComponent)
  },
  {
    path: 'novo',
    loadComponent: () =>
      import('./pages/cliente-form/cliente-form.component').then(c => c.ClienteFormComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/cliente-form/cliente-form.component').then(c => c.ClienteFormComponent)
  }
];
