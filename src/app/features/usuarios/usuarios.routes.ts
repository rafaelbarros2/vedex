import { Routes } from '@angular/router';
import { UsuariosListComponent } from './pages/usuarios-list/usuarios-list.component';
import { UsuarioFormComponent } from './pages/usuario-form/usuario-form.component';

export const usuariosRoutes: Routes = [
  { path: '', component: UsuariosListComponent },
  { path: 'novo', component: UsuarioFormComponent },
  { path: 'editar/:id', component: UsuarioFormComponent }
];
