import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

// --- Data Interfaces and Mock Data ---

interface VendaHistorico {
  numeroVenda: number;
  data: Date;
  cliente: string;
  valorTotal: number;
  formaPagamento: 'dinheiro' | 'cartao';
}

// Using a type for sortable columns to ensure type safety
type SortableColumn = keyof VendaHistorico;

const VENDAS_MOCK: VendaHistorico[] = [
  { numeroVenda: 101, data: new Date('2023-10-01T10:30:00'), cliente: 'João Silva', valorTotal: 150.75, formaPagamento: 'cartao' },
  { numeroVenda: 102, data: new Date('2023-10-01T11:45:00'), cliente: 'Maria Oliveira', valorTotal: 89.90, formaPagamento: 'dinheiro' },
  { numeroVenda: 103, data: new Date('2023-10-02T14:00:00'), cliente: 'Carlos Pereira', valorTotal: 320.50, formaPagamento: 'cartao' },
  { numeroVenda: 104, data: new Date('2023-10-03T09:15:00'), cliente: 'Ana Costa', valorTotal: 45.00, formaPagamento: 'dinheiro' },
  { numeroVenda: 105, data: new Date('2023-10-04T16:20:00'), cliente: 'Pedro Martins', valorTotal: 1200.00, formaPagamento: 'cartao' },
  { numeroVenda: 106, data: new Date('2023-10-05T18:00:00'), cliente: 'Sandra Dias', valorTotal: 78.25, formaPagamento: 'dinheiro' },
  { numeroVenda: 107, data: new Date('2023-10-05T19:10:00'), cliente: 'João Silva', valorTotal: 25.50, formaPagamento: 'cartao' },
  { numeroVenda: 108, data: new Date('2023-10-06T12:00:00'), cliente: 'Lucas Mendes', valorTotal: 550.40, formaPagamento: 'cartao' },
  { numeroVenda: 109, data: new Date('2023-10-07T13:30:00'), cliente: 'Fernanda Lima', valorTotal: 99.99, formaPagamento: 'dinheiro' },
  { numeroVenda: 110, data: new Date('2023-10-08T11:00:00'), cliente: 'Ricardo Alves', valorTotal: 215.00, formaPagamento: 'cartao' },
];


@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
   changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.css']
})
export class HistoricoComponent {
   // --- State Signals ---
  vendas = signal<VendaHistorico[]>([]);
  dataInicio = signal<string>(''); // Using string for <input type="date">
  dataFim = signal<string>('');    // Using string for <input type="date">
  termoBusca = signal<string>('');
  
  // Signals for sorting and pagination
  sortColumn = signal<SortableColumn>('numeroVenda');
  sortDirection = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
Math: any;

  constructor() {
    this.vendas.set(VENDAS_MOCK);
  }

  // --- Computed Signals for Reactive Data Flow ---

  // 1. Filter data based on search and date inputs
  filteredAndSortedVendas = computed(() => {
    const termo = this.termoBusca().toLowerCase();
    const inicio = this.dataInicio() ? new Date(this.dataInicio() + 'T00:00:00') : null;
    const fim = this.dataFim() ? new Date(this.dataFim() + 'T23:59:59') : null;
    const col = this.sortColumn();
    const dir = this.sortDirection();

    const filtered = this.vendas().filter(venda => {
      const dataVenda = new Date(venda.data);
      const matchBusca = termo 
        ? venda.cliente.toLowerCase().includes(termo) || venda.numeroVenda.toString().includes(termo) 
        : true;
      const matchData = (!inicio || dataVenda >= inicio) && (!fim || dataVenda <= fim);
      return matchBusca && matchData;
    });
    
    // Now, sort the filtered data
    return filtered.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];

        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
    });
  });

  // 2. Calculate total pages for pagination
  totalPages = computed(() => Math.ceil(this.filteredAndSortedVendas().length / 10));

  // 3. Get the data slice for the current page
  paginatedVendas = computed(() => {
    const startIndex = (this.currentPage() - 1) * 10;
    return this.filteredAndSortedVendas().slice(startIndex, startIndex + 10);
  });

  // --- Sorting and Pagination Methods ---
  setSort(column: SortableColumn) {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1); // Reset to first page on new sort
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

  // --- Helper and Formatting Methods ---
  formaToIcon(forma: string): string {
    return forma === 'dinheiro' ? '💵' : '💳';
  }

  formatPrice(price: number): string {
    return price.toFixed(2).replace('.', ',');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // --- Action Methods ---
  exportarRelatorio() {
    console.log('Exportando relatório com os seguintes dados:', this.filteredAndSortedVendas());
    // In a real app, a modal or toast notification would be better than an alert.
  }

  reimprimir(venda: VendaHistorico) {
    console.log('Reimprimir venda:', venda.numeroVenda);
  }

  cancelarVenda(venda: VendaHistorico) {
    console.log('Cancelar venda:', venda.numeroVenda);
  }
}

