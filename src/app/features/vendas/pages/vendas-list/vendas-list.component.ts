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
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { VendaService } from '../../services/venda.service';
import { VendaDetalhe, VendaFiltros, FormaPagamentoVenda, StatusVenda } from '../../models/venda.model';

@Component({
  selector: 'app-vendas-list',
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
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './vendas-list.component.html',
  styleUrl: './vendas-list.component.css'
})
export class VendasListComponent implements OnInit {
  private todasVendas = signal<VendaDetalhe[]>([]);

  filtros: VendaFiltros = { busca: '', status: 'todos', formaPagamento: 'todos' };

  vendasFiltradas = computed(() => {
    const todas = this.todasVendas();
    const { busca, status, formaPagamento } = this.filtros;

    return todas.filter(v => {
      const matchBusca = !busca || busca.trim() === ''
        || v.numeroVenda.toLowerCase().includes(busca.toLowerCase())
        || (v.cliente?.nome.toLowerCase().includes(busca.toLowerCase()) ?? false);

      const matchStatus = !status || status === 'todos' || v.status === status;

      const matchPagamento = !formaPagamento || formaPagamento === 'todos'
        || v.formaPagamento === formaPagamento;

      return matchBusca && matchStatus && matchPagamento;
    });
  });

  statusOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Concluída', value: 'concluida' },
    { label: 'Cancelada', value: 'cancelada' },
    { label: 'Em Devolução', value: 'devolucao' },
    { label: 'Devolvida', value: 'devolvida' }
  ];

  pagamentoOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Dinheiro', value: 'dinheiro' },
    { label: 'Cartão Débito', value: 'cartao_debito' },
    { label: 'Cartão Crédito', value: 'cartao_credito' },
    { label: 'PIX', value: 'pix' }
  ];

  carregando = false;

  constructor(
    private vendaService: VendaService,
    private router: Router,
    private messageService: MessageService
  ) {}

  irParaPDV() {
    this.router.navigate(['/pdv']);
  }

  ngOnInit() {
    this.carregarVendas();
  }

  carregarVendas() {
    this.carregando = true;
    this.vendaService.listarTodasAPI().subscribe({
      next: vendas => {
        this.todasVendas.set(vendas);
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as vendas'
        });
      }
    });
  }

  limparFiltros() {
    this.filtros = { busca: '', status: 'todos', formaPagamento: 'todos' };
  }

  verDetalhes(id: number) {
    this.router.navigate(['/vendas', id]);
  }

  getFormaPagamentoLabel(fp: FormaPagamentoVenda): string {
    return this.vendaService.getFormaPagamentoLabel(fp);
  }

  getFormaPagamentoIcon(fp: FormaPagamentoVenda): string {
    const icons: Record<FormaPagamentoVenda, string> = {
      dinheiro: 'pi pi-money-bill',
      cartao_debito: 'pi pi-credit-card',
      cartao_credito: 'pi pi-credit-card',
      pix: 'pi pi-qrcode'
    };
    return icons[fp];
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

  get totalVendas(): number {
    return this.vendasFiltradas()
      .filter(v => v.status === 'concluida')
      .reduce((acc, v) => acc + v.total, 0);
  }
}
