import { Component, OnInit, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CaixaService } from '../../services/caixa.service';
import { Lancamento, TipoLancamento, FormaPagamento } from '../../models/caixa.model';

@Component({
  selector: 'app-dashboard-caixa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    TableModule,
    InputNumberModule,
    InputTextModule,
    InputTextarea,
    DropdownModule,
    TagModule,
    DialogModule,
    CalendarModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './dashboard-caixa.component.html',
  styleUrl: './dashboard-caixa.component.css'
})
export class DashboardCaixaComponent implements OnInit {
  private caixaService = inject(CaixaService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  caixaAtual = this.caixaService.caixaAtual;
  resumo = this.caixaService.resumoCaixaAtual;
  lancamentos = signal<Lancamento[]>([]);

  // Dialogs
  showLancamentoDialog = false;
  showFechamentoDialog = false;

  // Form Lançamento
  tipoLancamento: TipoLancamento = 'saida';
  descricaoLancamento = '';
  valorLancamento = 0;
  categoriaLancamento = '';
  formaPagamentoLancamento: FormaPagamento = 'dinheiro';

  // Form Fechamento
  valorContado = 0;
  observacoesFechamento = '';

  // Filtros Extrato
  dataInicio: Date | null = null;
  dataFim: Date | null = null;
  filtroTipo: TipoLancamento | null = null;
  filtroCategoria: string | null = null;

  categorias: any[] = [];
  tiposLancamento: any[] = [
    { label: 'Entrada', value: 'entrada' },
    { label: 'Saída', value: 'saida' }
  ];
  formasPagamento: any[] = [
    { label: 'Dinheiro', value: 'dinheiro' },
    { label: 'Cartão de Débito', value: 'cartao_debito' },
    { label: 'Cartão de Crédito', value: 'cartao_credito' },
    { label: 'PIX', value: 'pix' }
  ];

  constructor() {
    // toObservable + take(1): aguarda caixaLoaded ser true UMA vez e inicializa
    // Evita NG0600 (escrita de signal dentro de effect) e o race condition
    toObservable(this.caixaService.caixaLoaded)
      .pipe(filter(loaded => loaded), take(1))
      .subscribe(() => {
        if (!this.caixaService.hasCaixaAberto()) {
          this.router.navigate(['/caixa/abertura']);
          return;
        }
        this.carregarCategorias();
        this.carregarLancamentos();
      });
  }

  ngOnInit() {
    // Inicialização movida para o constructor via toObservable
    // para aguardar o carregamento assíncrono de caixaAtual
  }

  carregarCategorias() {
    this.categorias = this.caixaService.categorias.map(c => ({ label: c, value: c }));
  }

  carregarLancamentos() {
    this.lancamentos.set(this.caixaService.getLancamentosCaixaAtual());
  }

  aplicarFiltros() {
    const filtros: any = {};

    if (this.dataInicio) filtros.dataInicio = this.dataInicio;
    if (this.dataFim) filtros.dataFim = this.dataFim;
    if (this.filtroTipo) filtros.tipo = this.filtroTipo;
    if (this.filtroCategoria) filtros.categoria = this.filtroCategoria;

    const lancamentosFiltrados = this.caixaService.getLancamentosFiltrados(filtros);
    this.lancamentos.set(lancamentosFiltrados);
  }

  limparFiltros() {
    this.dataInicio = null;
    this.dataFim = null;
    this.filtroTipo = null;
    this.filtroCategoria = null;
    this.carregarLancamentos();
  }

  // Lançamento
  abrirDialogLancamento(tipo: 'entrada' | 'saida', categoria?: string) {
    this.tipoLancamento = tipo;
    this.descricaoLancamento = '';
    this.valorLancamento = 0;
    this.formaPagamentoLancamento = 'dinheiro';

    if (categoria) {
      this.categoriaLancamento = categoria;
    } else {
      this.categoriaLancamento = tipo === 'entrada' ? 'Suprimento' : 'Sangria';
    }

    this.showLancamentoDialog = true;
  }

  salvarLancamento() {
    if (!this.descricaoLancamento || this.valorLancamento <= 0 || !this.categoriaLancamento) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    this.caixaService.registrarLancamento(
      this.descricaoLancamento,
      this.valorLancamento,
      this.tipoLancamento,
      this.categoriaLancamento,
      this.formaPagamentoLancamento
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Lançamento registrado com sucesso'
        });

        this.showLancamentoDialog = false;
        this.carregarLancamentos();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Erro ao registrar lançamento'
        });
      }
    });
  }

  // Fechamento
  abrirDialogFechamento() {
    const resumo = this.resumo();
    if (resumo) {
      this.valorContado = resumo.saldoAtual;
    }
    this.observacoesFechamento = '';
    this.showFechamentoDialog = true;
  }

  fecharCaixa() {
    if (this.valorContado < 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Valor contado inválido'
      });
      return;
    }

    this.caixaService.fecharCaixa(this.valorContado, this.observacoesFechamento)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Caixa fechado com sucesso!'
          });

          this.showFechamentoDialog = false;

          setTimeout(() => {
            this.router.navigate(['/caixa/abertura']);
          }, 2000);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Erro ao fechar caixa'
          });
        }
      });
  }

  getTipoSeverity(tipo: string): string {
    return tipo === 'entrada' ? 'success' : 'danger';
  }

  getTipoLabel(tipo: string): string {
    return tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA';
  }

  getFormaPagamentoLabel(forma: string): string {
    const map: any = {
      dinheiro: 'Dinheiro',
      cartao_debito: 'Débito',
      cartao_credito: 'Crédito',
      pix: 'PIX'
    };
    return map[forma] || forma;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
}
