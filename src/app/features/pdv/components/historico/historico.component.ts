import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VendaService } from '../../../vendas/services/venda.service';
import { VendaDetalhe } from '../../../vendas/models/venda.model';

type SortableColumn = 'numeroVenda' | 'dataVenda' | 'total';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.css']
})
export class HistoricoComponent implements OnInit {
  private vendaService = inject(VendaService);

  vendas = signal<VendaDetalhe[]>([]);
  carregando = signal(true);
  dataInicio = signal<string>('');
  dataFim = signal<string>('');
  termoBusca = signal<string>('');
  sortColumn = signal<SortableColumn>('dataVenda');
  sortDirection = signal<'asc' | 'desc'>('desc');
  currentPage = signal(1);

  ngOnInit(): void {
    this.vendaService.listarTodasAPI().subscribe({
      next: vendas => {
        this.vendas.set(vendas);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false)
    });
  }

  filteredAndSortedVendas = computed(() => {
    const termo = this.termoBusca().toLowerCase();
    const inicio = this.dataInicio() ? new Date(this.dataInicio() + 'T00:00:00') : null;
    const fim = this.dataFim() ? new Date(this.dataFim() + 'T23:59:59') : null;
    const col = this.sortColumn();
    const dir = this.sortDirection();

    const filtered = this.vendas().filter(venda => {
      const dataVenda = new Date(venda.dataVenda);
      const matchBusca = !termo
        || venda.numeroVenda.toLowerCase().includes(termo)
        || (venda.cliente?.nome.toLowerCase().includes(termo) ?? false);
      const matchData = (!inicio || dataVenda >= inicio) && (!fim || dataVenda <= fim);
      return matchBusca && matchData;
    });

    return filtered.sort((a, b) => {
      let valA: any, valB: any;
      if (col === 'dataVenda') { valA = new Date(a.dataVenda).getTime(); valB = new Date(b.dataVenda).getTime(); }
      else if (col === 'total') { valA = a.total; valB = b.total; }
      else { valA = a.numeroVenda; valB = b.numeroVenda; }
      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  totalPages = computed(() => Math.ceil(this.filteredAndSortedVendas().length / 10));

  paginatedVendas = computed(() => {
    const startIndex = (this.currentPage() - 1) * 10;
    return this.filteredAndSortedVendas().slice(startIndex, startIndex + 10);
  });

  setSort(column: SortableColumn) {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1);
  }

  getSortIcon(column: SortableColumn): string {
    if (this.sortColumn() !== column) return '↕️';
    return this.sortDirection() === 'asc' ? '🔼' : '🔽';
  }

  changePage(newPage: number) {
    if (newPage > 0 && newPage <= this.totalPages()) {
      this.currentPage.set(newPage);
    }
  }

  getFormaPagamentoLabel(fp: string): string {
    const labels: Record<string, string> = {
      dinheiro: 'Dinheiro',
      cartao_debito: 'Cartão Débito',
      cartao_credito: 'Cartão Crédito',
      pix: 'PIX'
    };
    return labels[fp] || fp;
  }

  formaToIcon(forma: string): string {
    const icons: Record<string, string> = {
      dinheiro: '💵',
      cartao_debito: '💳',
      cartao_credito: '💳',
      pix: '📱'
    };
    return icons[forma] || '💰';
  }

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
