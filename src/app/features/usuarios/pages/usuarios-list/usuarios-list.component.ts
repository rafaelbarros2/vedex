import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario, PerfilUsuario, StatusUsuario } from '../../models/usuario.model';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    TagModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.css'
})
export class UsuariosListComponent implements OnInit {
  usuarios = signal<Usuario[]>([]);
  termoBusca = '';
  perfilFiltro: PerfilUsuario | null = null;
  statusFiltro: StatusUsuario | null = null;

  perfisOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Gerente', value: 'gerente' },
    { label: 'Operador', value: 'operador' },
    { label: 'Vendedor', value: 'vendedor' }
  ];

  statusOptions = [
    { label: 'Ativo', value: 'ativo' },
    { label: 'Inativo', value: 'inativo' },
    { label: 'Bloqueado', value: 'bloqueado' }
  ];

  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.usuariosService.listarTodosAPI().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os usuários'
        });
      }
    });
  }

  buscarUsuarios() {
    if (this.termoBusca.trim()) {
      this.usuarios.set(this.usuariosService.buscarUsuarios(this.termoBusca));
    } else {
      this.aplicarFiltros();
    }
  }

  aplicarFiltros() {
    let usuarios = this.usuariosService.getUsuarios();

    if (this.perfilFiltro) {
      usuarios = usuarios.filter(u => u.perfil === this.perfilFiltro);
    }

    if (this.statusFiltro) {
      usuarios = usuarios.filter(u => u.status === this.statusFiltro);
    }

    this.usuarios.set(usuarios);
  }

  limparFiltros() {
    this.termoBusca = '';
    this.perfilFiltro = null;
    this.statusFiltro = null;
    this.carregarUsuarios();
  }

  novoUsuario() {
    this.router.navigate(['/usuarios/novo']);
  }

  editarUsuario(id: number) {
    this.router.navigate(['/usuarios/editar', id]);
  }

  deletarUsuario(usuario: Usuario) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja inativar o usuário ${usuario.nome}?`,
      header: 'Confirmar Inativação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.usuariosService.inativarAPI(usuario.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Usuário inativado com sucesso'
            });
            this.carregarUsuarios();
          },
          error: (error) => {
            const msg = error?.error?.mensagem || 'Erro ao inativar usuário';
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: msg
            });
          }
        });
      }
    });
  }

  alterarStatus(usuario: Usuario, novoStatus: StatusUsuario) {
    let operacao$: Observable<void>;

    if (novoStatus === 'ativo') {
      operacao$ = this.usuariosService.ativarAPI(usuario.id);
    } else if (novoStatus === 'bloqueado') {
      operacao$ = this.usuariosService.bloquearAPI(usuario.id);
    } else {
      operacao$ = this.usuariosService.inativarAPI(usuario.id);
    }

    operacao$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Status Alterado',
          detail: `Status do usuário alterado para ${novoStatus}`
        });
        this.carregarUsuarios();
      },
      error: (error) => {
        const msg = error?.error?.mensagem || 'Erro ao alterar status';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: msg
        });
      }
    });
  }

  getPerfilLabel(perfil: PerfilUsuario): string {
    const labels: Record<PerfilUsuario, string> = {
      admin: 'Admin',
      gerente: 'Gerente',
      operador: 'Operador',
      vendedor: 'Vendedor'
    };
    return labels[perfil];
  }

  getPerfilSeverity(perfil: PerfilUsuario): string {
    const severities: Record<PerfilUsuario, string> = {
      admin: 'danger',
      gerente: 'warning',
      operador: 'info',
      vendedor: 'success'
    };
    return severities[perfil];
  }

  getStatusSeverity(status: StatusUsuario): string {
    const severities: Record<StatusUsuario, string> = {
      ativo: 'success',
      inativo: 'warning',
      bloqueado: 'danger'
    };
    return severities[status];
  }

  getStatusLabel(status: StatusUsuario): string {
    const labels: Record<StatusUsuario, string> = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      bloqueado: 'Bloqueado'
    };
    return labels[status];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
