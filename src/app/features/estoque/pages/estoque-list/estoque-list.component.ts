import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextarea } from 'primeng/inputtextarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { EstoqueService } from '../../services/estoque.service';
import { ProdutoEstoque, EstoqueFiltros } from '../../models/estoque.model';
import { EntradaEstoque, SaidaEstoque, AjusteEstoque } from '../../models/movimentacao.model';

@Component({
  selector: 'app-estoque-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    CardModule,
    DialogModule,
    InputNumberModule,
    InputTextarea,
    ToastModule,
    RouterLink
  ],
  providers: [MessageService],
  templateUrl: './estoque-list.component.html',
  styleUrl: './estoque-list.component.css'
})
export class EstoqueListComponent implements OnInit {
  produtos = computed(() => this.estoqueService.produtos());
  alertas = computed(() => this.estoqueService.alertasEstoque());

  filtros = signal<EstoqueFiltros>({});
  produtosFiltrados = computed(() => this.estoqueService.listarProdutos(this.filtros()));

  categorias = computed(() => {
    const cats = this.estoqueService.getCategorias();
    return [{ label: 'Todas', value: null }, ...cats.map(c => ({ label: c, value: c }))];
  });

  searchTerm = '';
  selectedCategoria: string | null = null;
  showEstoqueBaixo = false;
  showSemEstoque = false;

  // Dialogs
  showMovimentacaoDialog = false;
  tipoMovimentacao: 'entrada' | 'saida' | 'ajuste' = 'entrada';
  produtoSelecionado: ProdutoEstoque | null = null;

  // Form movimentação
  quantidade = 0;
  quantidadeNova = 0;
  precoCusto = 0;
  fornecedor = '';
  motivo = '';
  observacao = '';

  constructor(
    private estoqueService: EstoqueService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    // Produtos carregados automaticamente no EstoqueService constructor
  }

  aplicarFiltros() {
    this.filtros.set({
      busca: this.searchTerm,
      categoria: this.selectedCategoria || undefined,
      estoqueBaixo: this.showEstoqueBaixo,
      semEstoque: this.showSemEstoque
    });
  }

  limparFiltros() {
    this.searchTerm = '';
    this.selectedCategoria = null;
    this.showEstoqueBaixo = false;
    this.showSemEstoque = false;
    this.aplicarFiltros();
  }

  getEstoqueStatus(produto: ProdutoEstoque): { severity: string, label: string } {
    if (produto.estoque === 0) {
      return { severity: 'danger', label: 'SEM ESTOQUE' };
    } else if (produto.estoque <= produto.estoqueMinimo * 0.5) {
      return { severity: 'warning', label: 'CRÍTICO' };
    } else if (produto.estoque <= produto.estoqueMinimo) {
      return { severity: 'info', label: 'BAIXO' };
    }
    return { severity: 'success', label: 'OK' };
  }

  getUrgenciaSeverity(urgencia: string): string {
    const map: any = {
      critica: 'danger',
      media: 'warning',
      baixa: 'info'
    };
    return map[urgencia] || 'info';
  }

  abrirMovimentacao(tipo: 'entrada' | 'saida' | 'ajuste', produto: ProdutoEstoque) {
    this.produtoSelecionado = produto;
    this.tipoMovimentacao = tipo;
    this.quantidade = 0;
    this.quantidadeNova = produto.estoque;
    this.precoCusto = produto.precoCusto;
    this.fornecedor = produto.fornecedor || '';
    this.motivo = '';
    this.observacao = '';
    this.showMovimentacaoDialog = true;
  }

  salvarMovimentacao() {
    if (!this.produtoSelecionado) return;

    if (this.tipoMovimentacao === 'entrada') {
      if (this.quantidade <= 0) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Quantidade deve ser maior que zero' });
        return;
      }
      const entrada: EntradaEstoque = {
        produtoId: this.produtoSelecionado.id,
        quantidade: this.quantidade,
        precoCusto: this.precoCusto,
        fornecedor: this.fornecedor,
        observacao: this.observacao
      };
      this.estoqueService.registrarEntradaAPI(entrada).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Entrada de ${this.quantidade} unidades registrada` });
          this.showMovimentacaoDialog = false;
          this.produtoSelecionado = null;
        },
        error: (e: any) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: e.error?.message || e.message || 'Erro ao registrar entrada' })
      });

    } else if (this.tipoMovimentacao === 'saida') {
      if (this.quantidade <= 0) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Quantidade deve ser maior que zero' });
        return;
      }
      if (!this.motivo) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Motivo é obrigatório para saída' });
        return;
      }
      const saida: SaidaEstoque = {
        produtoId: this.produtoSelecionado.id,
        quantidade: this.quantidade,
        motivo: this.motivo,
        observacao: this.observacao
      };
      this.estoqueService.registrarSaidaAPI(saida).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Saída de ${this.quantidade} unidades registrada` });
          this.showMovimentacaoDialog = false;
          this.produtoSelecionado = null;
        },
        error: (e: any) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: e.error?.message || e.message || 'Erro ao registrar saída' })
      });

    } else if (this.tipoMovimentacao === 'ajuste') {
      if (this.quantidadeNova < 0) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Quantidade não pode ser negativa' });
        return;
      }
      if (!this.motivo) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Motivo é obrigatório para ajuste' });
        return;
      }
      const ajuste: AjusteEstoque = {
        produtoId: this.produtoSelecionado.id,
        quantidadeNova: this.quantidadeNova,
        motivo: this.motivo,
        observacao: this.observacao
      };
      this.estoqueService.registrarAjusteAPI(ajuste).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Ajuste de estoque registrado' });
          this.showMovimentacaoDialog = false;
          this.produtoSelecionado = null;
        },
        error: (e: any) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: e.error?.message || e.message || 'Erro ao registrar ajuste' })
      });
    }
  }

  verHistorico(produto: ProdutoEstoque) {
    this.router.navigate(['/estoque/historico', produto.id]);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
