import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextarea } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { VendaService } from '../../services/venda.service';
import { VendaDetalhe, FormaPagamentoVenda, StatusVenda } from '../../models/venda.model';

@Component({
  selector: 'app-venda-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextarea,
    DividerModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './venda-detalhe.component.html',
  styleUrl: './venda-detalhe.component.css'
})
export class VendaDetalheComponent implements OnInit {
  venda = signal<VendaDetalhe | null>(null);
  carregando = false;
  cancelando = false;
  motivoCancelamento = '';
  mostrarCancelamento = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendaService: VendaService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarVenda(Number(id));
    }
  }

  carregarVenda(id: number) {
    this.carregando = true;
    this.vendaService.buscarPorIdAPI(id).subscribe({
      next: venda => {
        this.venda.set(venda);
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os dados da venda'
        });
      }
    });
  }

  voltar() {
    this.router.navigate(['/vendas/historico']);
  }

  confirmarCancelamento() {
    if (!this.motivoCancelamento.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Informe o motivo do cancelamento'
      });
      return;
    }

    const v = this.venda();
    if (!v) return;

    this.confirmationService.confirm({
      message: `Tem certeza que deseja cancelar a venda ${v.numeroVenda}?`,
      header: 'Confirmar Cancelamento',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancelar Venda',
      rejectLabel: 'Voltar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.cancelando = true;
        // usuarioId = 1 como placeholder (futuro: pegar do token JWT)
        this.vendaService.cancelarAPI(v.id, 1, this.motivoCancelamento).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Venda cancelada com sucesso'
            });
            this.mostrarCancelamento = false;
            this.motivoCancelamento = '';
            this.cancelando = false;
            this.carregarVenda(v.id);
          },
          error: err => {
            this.cancelando = false;
            const msg = err?.error?.mensagem || 'Erro ao cancelar venda';
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

  getFormaPagamentoLabel(fp: FormaPagamentoVenda): string {
    return this.vendaService.getFormaPagamentoLabel(fp);
  }

  getStatusLabel(status: StatusVenda): string {
    return this.vendaService.getStatusLabel(status);
  }

  getStatusSeverity(status: StatusVenda): string {
    return this.vendaService.getStatusSeverity(status);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  get podeCancelar(): boolean {
    return this.venda()?.status === 'concluida';
  }
}
