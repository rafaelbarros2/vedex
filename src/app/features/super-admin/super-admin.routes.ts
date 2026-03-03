import { Routes } from '@angular/router';

export const superAdminRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/super-admin-layout/super-admin-layout.component').then(
                c => c.SuperAdminLayoutComponent
            ),
        children: [
            {
                path: '',
                redirectTo: 'lojas',
                pathMatch: 'full'
            },
            {
                path: 'lojas',
                loadComponent: () =>
                    import('./pages/lojas-list/lojas-list.component').then(
                        c => c.LojasListComponent
                    )
            },
            {
                path: 'lojas/nova',
                loadComponent: () =>
                    import('./pages/nova-loja/nova-loja.component').then(
                        c => c.NovaLojaComponent
                    )
            }
        ]
    }
];
