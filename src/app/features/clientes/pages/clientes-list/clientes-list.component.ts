import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, ClienteFiltros } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './clientes-list.component.html',
  styleUrl: './clientes-list.component.css'
})
export class ClientesListComponent implements OnInit {
  private todosClientes = signal<Cliente[]>([]);

  filtros: ClienteFiltros = { busca: '', status: 'todos' };

  clientesFiltrados = computed(() => {
    const todos = this.todosClientes();
    const { busca, status } = this.filtros;

    return todos.filter(c => {
      const matchBusca = !busca || busca.trim() === ''
        || c.nome.toLowerCase().includes(busca.toLowerCase())
        || c.cpfCnpj.replace(/\D/g, '').includes(busca.replace(/\D/g, ''));

      const matchStatus = !status || status === 'todos'
        || (status === 'ativo' && c.ativo)
        || (status === 'inativo' && !c.ativo);

      return matchBusca && matchStatus;
    });
  });

  statusOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Ativos', value: 'ativo' },
    { label: 'Inativos', value: 'inativo' }
  ];

  carregando = false;

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.carregarClientes();
  }

  carregarClientes() {
    this.carregando = true;
    this.clienteService.listarTodosAPI().subscribe({
      next: clientes => {
        this.todosClientes.set(clientes);
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os clientes'
        });
      }
    });
  }

  limparFiltros() {
    this.filtros = { busca: '', status: 'todos' };
  }

  novoCliente() {
    this.router.navigate(['/clientes/novo']);
  }

  editarCliente(id: number) {
    this.router.navigate(['/clientes', id]);
  }

  alterarStatus(cliente: Cliente) {
    if (cliente.ativo) {
      this.clienteService.inativarAPI(cliente.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `${cliente.nome} inativado com sucesso`
          });
          this.todosClientes.update(lista =>
            lista.map(c => c.id === cliente.id ? { ...c, ativo: false } : c)
          );
        },
        error: err => this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.error?.message || 'Erro ao inativar cliente'
        })
      });
    } else {
      this.clienteService.ativarAPI(cliente.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `${cliente.nome} ativado com sucesso`
          });
          this.todosClientes.update(lista =>
            lista.map(c => c.id === cliente.id ? { ...c, ativo: true } : c)
          );
        },
        error: err => this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.error?.message || 'Erro ao ativar cliente'
        })
      });
    }
  }

  excluirCliente(cliente: Cliente, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir o cliente "${cliente.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.clienteService.excluirAPI(cliente.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Cliente excluído com sucesso'
            });
            this.todosClientes.update(lista => lista.filter(c => c.id !== cliente.id));
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: err.error?.message || 'Não foi possível excluir o cliente'
            });
          }
        });
      }
    });
  }

  formatCpfCnpj(valor: string): string {
    const digits = valor.replace(/\D/g, '');
    if (digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (digits.length === 14) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return valor;
  }

  formatDate(date?: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getStatusSeverity(ativo: boolean): string {
    return ativo ? 'success' : 'danger';
  }

  getStatusLabel(ativo: boolean): string {
    return ativo ? 'Ativo' : 'Inativo';
  }
}
