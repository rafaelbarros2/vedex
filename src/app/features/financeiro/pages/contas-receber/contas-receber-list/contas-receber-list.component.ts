import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ContaReceberService } from '../../../services/conta-receber.service';
import { ContaReceber, ContaReceberFiltros } from '../../../models/conta-receber.model';

@Component({
  selector: 'app-contas-receber-list',
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
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './contas-receber-list.component.html',
})
export class ContasReceberListComponent implements OnInit {
  private contaReceberService = inject(ContaReceberService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  private todasContas = signal<ContaReceber[]>([]);
  carregando = false;

  filtros: ContaReceberFiltros = { busca: '', status: 'todos' };

  statusOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Pendente', value: 'PENDENTE' },
    { label: 'Recebido', value: 'RECEBIDO' },
    { label: 'Vencido', value: 'VENCIDO' },
    { label: 'Cancelado', value: 'CANCELADO' },
  ];

  contasFiltradas = computed(() => {
    const todas = this.todasContas();
    const { busca, status } = this.filtros;
    return todas.filter(c => {
      const matchBusca = !busca?.trim() ||
        c.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        (c.categoria ?? '').toLowerCase().includes(busca.toLowerCase()) ||
        (c.clienteNome ?? '').toLowerCase().includes(busca.toLowerCase());
      const matchStatus = !status || status === 'todos' || c.status === status;
      return matchBusca && matchStatus;
    });
  });

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.contaReceberService.listarTodosAPI().subscribe({
      next: contas => {
        this.todasContas.set(contas);
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as contas a receber' });
      },
    });
  }

  nova() {
    this.router.navigate(['/financeiro/receber/nova']);
  }

  editar(conta: ContaReceber) {
    this.router.navigate(['/financeiro/receber', conta.id]);
  }

  marcarComoRecebido(conta: ContaReceber, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Marcar "${conta.descricao}" como recebida?`,
      header: 'Confirmar Recebimento',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.contaReceberService.marcarComoRecebidoAPI(conta.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta marcada como recebida' });
            this.todasContas.update(lista => lista.map(c => c.id === conta.id ? { ...c, status: 'RECEBIDO' as const } : c));
          },
          error: err => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.mensagem || 'Erro ao confirmar recebimento' }),
        });
      },
    });
  }

  cancelar(conta: ContaReceber, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Cancelar a conta "${conta.descricao}"?`,
      header: 'Confirmar Cancelamento',
      icon: 'pi pi-ban',
      acceptLabel: 'Cancelar Conta',
      rejectLabel: 'Voltar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.contaReceberService.cancelarAPI(conta.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta cancelada' });
            this.todasContas.update(lista => lista.map(c => c.id === conta.id ? { ...c, status: 'CANCELADO' as const } : c));
          },
          error: err => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.mensagem || 'Erro ao cancelar conta' }),
        });
      },
    });
  }

  excluir(conta: ContaReceber, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Excluir a conta "${conta.descricao}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.contaReceberService.excluirAPI(conta.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta excluída' });
            this.todasContas.update(lista => lista.filter(c => c.id !== conta.id));
          },
          error: err => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.mensagem || 'Erro ao excluir conta' }),
        });
      },
    });
  }

  getStatusSeverity(status: string): string {
    const map: Record<string, string> = {
      PENDENTE: 'warning',
      RECEBIDO: 'success',
      CANCELADO: 'secondary',
      VENCIDO: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor ?? 0);
  }

  formatarData(dataStr: string): string {
    if (!dataStr) return '';
    const parts = dataStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
}
