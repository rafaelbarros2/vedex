import { Routes } from '@angular/router';
import { NotasFiscaisListComponent } from './pages/notas-fiscais-list/notas-fiscais-list.component';
import { NotaFiscalFormComponent } from './pages/nota-fiscal-form/nota-fiscal-form.component';

export const notasFiscaisRoutes: Routes = [
  { path: '', component: NotasFiscaisListComponent },
  { path: 'nova', component: NotaFiscalFormComponent }
  // Rotas futuras:
  // { path: 'visualizar/:id', component: NotaFiscalViewComponent }
];
