import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { VendaService } from '../vendas/services/venda.service';
import { ClienteService } from '../clientes/services/cliente.service';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private vendaService = inject(VendaService);
  private clienteService = inject(ClienteService);

  loading = signal(true);

  // Dados carregados da API
  private _vendasHoje = signal(0);
  private _produtosVendidosHoje = signal(0);
  private _ticketMedio = signal(0);
  private _totalClientes = signal(0);

  stats = computed(() => [
    {
      title: 'Vendas Hoje',
      value: this.loading()
        ? 'Carregando...'
        : this._vendasHoje().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: '💰',
      trendClass: 'text-green-600'
    },
    {
      title: 'Produtos Vendidos',
      value: this.loading() ? 'Carregando...' : `${this._produtosVendidosHoje()} un.`,
      icon: '📦',
      trendClass: 'text-green-600'
    },
    {
      title: 'Ticket Médio',
      value: this.loading()
        ? 'Carregando...'
        : this._ticketMedio().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: '🎯',
      trendClass: 'text-blue-600'
    },
    {
      title: 'Clientes Cadastrados',
      value: this.loading() ? 'Carregando...' : `${this._totalClientes()}`,
      icon: '👥',
      trendClass: 'text-purple-600'
    }
  ]);

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    forkJoin({
      vendas: this.vendaService.listarTodasAPI().pipe(catchError(() => of([]))),
      clientes: this.clienteService.listarTodosAPI().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ vendas, clientes }) => {
        const hoje = new Date();
        const vendasHoje = vendas.filter(v => {
          const dataVenda = new Date(v.dataVenda);
          return (
            v.status !== 'cancelada' &&
            dataVenda.getDate() === hoje.getDate() &&
            dataVenda.getMonth() === hoje.getMonth() &&
            dataVenda.getFullYear() === hoje.getFullYear()
          );
        });

        const totalVendas = vendasHoje.reduce((acc, v) => acc + v.total, 0);
        const totalProdutos = vendasHoje.reduce((acc, v) =>
          acc + v.itens.reduce((s, i) => s + i.quantidade, 0), 0);
        const ticketMedio = vendasHoje.length > 0 ? totalVendas / vendasHoje.length : 0;

        this._vendasHoje.set(totalVendas);
        this._produtosVendidosHoje.set(totalProdutos);
        this._ticketMedio.set(ticketMedio);
        this._totalClientes.set(clientes.length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
