import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { EstoqueService } from '../../services/estoque.service';
import { MovimentacaoEstoque } from '../../models/movimentacao.model';
import { ProdutoEstoque } from '../../models/estoque.model';

@Component({
  selector: 'app-historico-movimentacao',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    TimelineModule
  ],
  templateUrl: './historico-movimentacao.component.html',
  styleUrl: './historico-movimentacao.component.css'
})
export class HistoricoMovimentacaoComponent implements OnInit {
  produtoId: number | null = null;
  produto = signal<ProdutoEstoque | undefined>(undefined);
  movimentacoes = signal<MovimentacaoEstoque[]>([]);
  todasMovimentacoes = false;

  constructor(
    private estoqueService: EstoqueService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.produtoId = +id;
      this.carregarHistoricoProduto();
    } else {
      this.todasMovimentacoes = true;
      this.carregarTodasMovimentacoes();
    }
  }

  carregarHistoricoProduto() {
    if (!this.produtoId) return;

    const produtoEncontrado = this.estoqueService.getProdutoById(this.produtoId);
    this.produto.set(produtoEncontrado);

    if (produtoEncontrado) {
      const historico = this.estoqueService.getHistoricoProduto(this.produtoId);
      this.movimentacoes.set(historico);
    }
  }

  carregarTodasMovimentacoes() {
    const todas = this.estoqueService.getTodasMovimentacoes();
    this.movimentacoes.set(todas);
  }

  getTipoSeverity(tipo: string): string {
    const map: any = {
      entrada: 'success',
      saida: 'warning',
      ajuste: 'info'
    };
    return map[tipo] || 'info';
  }

  getTipoLabel(tipo: string): string {
    const map: any = {
      entrada: 'ENTRADA',
      saida: 'SAÍDA',
      ajuste: 'AJUSTE'
    };
    return map[tipo] || tipo.toUpperCase();
  }

  getTipoIcon(tipo: string): string {
    const map: any = {
      entrada: 'pi-plus-circle',
      saida: 'pi-minus-circle',
      ajuste: 'pi-pencil'
    };
    return map[tipo] || 'pi-circle';
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
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  voltar() {
    this.router.navigate(['/estoque']);
  }
}
