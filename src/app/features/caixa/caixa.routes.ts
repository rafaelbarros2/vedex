import { Routes } from '@angular/router';
import { AberturaCaixaComponent } from './pages/abertura-caixa/abertura-caixa.component';
import { DashboardCaixaComponent } from './pages/dashboard-caixa/dashboard-caixa.component';

export const caixaRoutes: Routes = [
  { path: '', component: DashboardCaixaComponent },
  { path: 'abertura', component: AberturaCaixaComponent }
];
