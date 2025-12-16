import { Routes } from '@angular/router';
import { ProdutoListComponent } from './pages/produto-list/produto-list.component';
import { ProdutoViewComponent } from './pages/produto-view/produto-view.component';
import { CategoriaListComponent } from './pages/categoria-list/categoria-list.component';
import { CategoriaViewComponent } from './pages/categoria-view/categoria-view.component';

export const produtosRoutes: Routes = [
  {
    path: '',
    component: ProdutoListComponent
  },
  {
    path: 'novo',
    component: ProdutoViewComponent
  },
  {
    path: ':id',
    component: ProdutoViewComponent
  }
];

export const categoriasRoutes: Routes = [
  {
    path: '',
    component: CategoriaListComponent
  },
  {
    path: 'novo',
    component: CategoriaViewComponent
  },
  {
    path: ':id',
    component: CategoriaViewComponent
  }
];
