import { Routes } from '@angular/router';
import { PdvMainComponent } from './components/pdv-main/pdv-main.component';
import { HistoricoComponent } from './components/historico/historico.component';

export const pdvRoutes: Routes = [
  {
    path: '',
    component: PdvMainComponent
  },
  {
    path: 'historico',
    component: HistoricoComponent
  }
];