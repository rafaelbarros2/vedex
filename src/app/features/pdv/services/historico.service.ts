import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VendaHistorico, VendaHistoricoItem } from '../../../shared/models/venda-historico.model';

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {
  private vendas = signal<VendaHistorico[]>([]);

  constructor() {
    this.carregarDadosIniciais();
  }

  obterVendas(): Observable<VendaHistorico[]> {
    return of(this.vendas());
  }

  adicionarVenda(venda: VendaHistorico): void {
    const vendasAtuais = this.vendas();
    this.vendas.set([venda, ...vendasAtuais]);
  }

  buscarVendaPorNumero(numeroVenda: string): VendaHistorico | null {
    return this.vendas().find(v => v.numeroVenda === numeroVenda) || null;
  }

  cancelarVenda(vendaId: string): boolean {
    const vendas = this.vendas();
    const index = vendas.findIndex(v => v.id === vendaId);

    if (index !== -1 && vendas[index].status === 'concluida') {
      const vendasAtualizadas = [...vendas];
      vendasAtualizadas[index] = {
        ...vendasAtualizadas[index],
        status: 'cancelada'
      };
      this.vendas.set(vendasAtualizadas);
      return true;
    }

    return false;
  }

  obterResumoVendas(): {
    totalVendas: number;
    totalFaturamento: number;
    vendasDinheiro: number;
    vendasCartao: number;
    vendasCanceladas: number;
  } {
    const vendas = this.vendas();

    return {
      totalVendas: vendas.filter(v => v.status === 'concluida').length,
      totalFaturamento: vendas
        .filter(v => v.status === 'concluida')
        .reduce((acc, v) => acc + v.total, 0),
      vendasDinheiro: vendas
        .filter(v => v.status === 'concluida' && v.formaPagamento === 'dinheiro')
        .length,
      vendasCartao: vendas
        .filter(v => v.status === 'concluida' && v.formaPagamento === 'cartao')
        .length,
      vendasCanceladas: vendas.filter(v => v.status === 'cancelada').length
    };
  }

  private carregarDadosIniciais(): void {
    // Dados mock para desenvolvimento
    const vendasMock: VendaHistorico[] = [
      {
        id: 'v1',
        numeroVenda: '#0001234',
        data: new Date('2024-01-15'),
        hora: '14:30',
        operador: 'João Silva',
        cliente: 'Maria Santos',
        items: [
          {
            id: 1,
            nome: 'Coca-Cola 350ml',
            codigo: '7894900011517',
            categoria: 'Bebidas',
            preco: 4.50,
            quantidade: 2,
            subtotal: 9.00,
            emoji: '🥤'
          },
          {
            id: 2,
            nome: 'Pão Francês',
            codigo: '123456789',
            categoria: 'Padaria',
            preco: 0.65,
            quantidade: 6,
            subtotal: 3.90,
            emoji: '🥖'
          }
        ],
        subtotal: 12.90,
        desconto: 0,
        total: 12.90,
        formaPagamento: 'dinheiro',
        valorRecebido: 15.00,
        troco: 2.10,
        status: 'concluida'
      },
      {
        id: 'v2',
        numeroVenda: '#0001235',
        data: new Date('2024-01-15'),
        hora: '15:45',
        operador: 'João Silva',
        items: [
          {
            id: 3,
            nome: 'Leite Integral 1L',
            codigo: '7891000100103',
            categoria: 'Laticínios',
            preco: 4.89,
            quantidade: 1,
            subtotal: 4.89,
            emoji: '🥛'
          },
          {
            id: 4,
            nome: 'Açúcar Cristal 1kg',
            codigo: '7891234567890',
            categoria: 'Mercearia',
            preco: 3.99,
            quantidade: 2,
            subtotal: 7.98,
            emoji: '🍯'
          },
          {
            id: 5,
            nome: 'Banana Prata',
            categoria: 'Frutas',
            preco: 5.99,
            quantidade: 1,
            subtotal: 5.99,
            emoji: '🍌'
          }
        ],
        subtotal: 18.86,
        desconto: 1.86,
        total: 17.00,
        formaPagamento: 'cartao',
        status: 'concluida'
      },
      {
        id: 'v3',
        numeroVenda: '#0001236',
        data: new Date('2024-01-15'),
        hora: '16:20',
        operador: 'Ana Costa',
        items: [
          {
            id: 6,
            nome: 'Sabonete Dove',
            codigo: '7891150001008',
            categoria: 'Higiene',
            preco: 2.99,
            quantidade: 3,
            subtotal: 8.97,
            emoji: '🧼'
          }
        ],
        subtotal: 8.97,
        desconto: 0,
        total: 8.97,
        formaPagamento: 'dinheiro',
        valorRecebido: 10.00,
        troco: 1.03,
        status: 'concluida'
      },
      {
        id: 'v4',
        numeroVenda: '#0001237',
        data: new Date('2024-01-14'),
        hora: '10:15',
        operador: 'João Silva',
        items: [
          {
            id: 7,
            nome: 'Arroz Branco 5kg',
            codigo: '7891234567891',
            categoria: 'Mercearia',
            preco: 18.99,
            quantidade: 1,
            subtotal: 18.99,
            emoji: '🍚'
          }
        ],
        subtotal: 18.99,
        desconto: 0,
        total: 18.99,
        formaPagamento: 'cartao',
        status: 'cancelada'
      },
      {
        id: 'v5',
        numeroVenda: '#0001238',
        data: new Date('2024-01-14'),
        hora: '11:30',
        operador: 'Ana Costa',
        items: [
          {
            id: 8,
            nome: 'Café Pilão 500g',
            codigo: '7891024001012',
            categoria: 'Mercearia',
            preco: 8.99,
            quantidade: 2,
            subtotal: 17.98,
            emoji: '☕'
          },
          {
            id: 9,
            nome: 'Biscoito Maria',
            codigo: '7891234567892',
            categoria: 'Biscoitos',
            preco: 3.49,
            quantidade: 1,
            subtotal: 3.49,
            emoji: '🍪'
          }
        ],
        subtotal: 21.47,
        desconto: 2.47,
        total: 19.00,
        formaPagamento: 'dinheiro',
        valorRecebido: 20.00,
        troco: 1.00,
        status: 'concluida'
      }
    ];

    this.vendas.set(vendasMock);
  }
}