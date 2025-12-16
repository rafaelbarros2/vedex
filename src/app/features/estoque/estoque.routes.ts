import { Routes } from '@angular/router';
import { EstoqueListComponent } from './pages/estoque-list/estoque-list.component';
import { HistoricoMovimentacaoComponent } from './pages/historico-movimentacao/historico-movimentacao.component';

export const estoqueRoutes: Routes = [
  {
    path: '',
    component: EstoqueListComponent
  },
  {
    path: 'historico',
    component: HistoricoMovimentacaoComponent
  },
  {
    path: 'historico/:id',
    component: HistoricoMovimentacaoComponent
  }
];
