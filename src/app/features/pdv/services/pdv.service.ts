import { Injectable, signal, computed, inject } from '@angular/core';
import { Produto } from '../../../shared/models/produto.model';
import { CarrinhoItem } from '../../../shared/models/carrinho.model';
import { Venda } from '../../../shared/models/venda.model';
import { VendaHistorico, VendaHistoricoItem } from '../../../shared/models/venda-historico.model';
import { HistoricoService } from './historico.service';
import { CaixaService } from '../../caixa/services/caixa.service';
import { FormaPagamento } from '../../caixa/models/caixa.model';

@Injectable({
  providedIn: 'root'
})
export class PdvService {
  // Dados mockados dos produtos
  produtos = signal<Produto[]>([
    {
      id: 1,
      nome: 'Pão Francês',
      codigoInterno: '001',
      categoria: 'Padaria',
      unidadeMedida: 'UN',
      precoCusto: 6.00,
      precoVenda: 8.50,
      permiteDesconto: true,
      estoque: 45,
      estoqueMinimo: 10,
      controlarEstoque: true,
      permiteEstoqueNegativo: false,
      ativo: true,
      destaque: false,
      novidade: false,
      promocao: false,
      emoji: '🍞',
      preco: 8.50,
      unidadeEstoque: 'un'
    },
    {
      id: 2,
      nome: 'Leite Integral 1L',
      codigoInterno: '002',
      categoria: 'Laticínios',
      unidadeMedida: 'UN',
      precoCusto: 4.00,
      precoVenda: 5.99,
      permiteDesconto: true,
      estoque: 120,
      estoqueMinimo: 20,
      controlarEstoque: true,
      permiteEstoqueNegativo: false,
      ativo: true,
      destaque: false,
      novidade: false,
      promocao: false,
      emoji: '🥛',
      preco: 5.99,
      unidadeEstoque: 'un'
    },
    {
      id: 3,
      nome: 'Queijo Minas Frescal (kg)',
      codigoInterno: '003',
      categoria: 'Laticínios',
      unidadeMedida: 'KG',
      precoCusto: 25.00,
      precoVenda: 32.90,
      permiteDesconto: true,
      estoque: 18,
      estoqueMinimo: 5,
      controlarEstoque: true,
      permiteEstoqueNegativo: false,
      ativo: true,
      destaque: false,
      novidade: false,
      promocao: false,
      emoji: '🧀',
      preco: 32.90,
      unidadeEstoque: 'kg'
    },
    {
      id: 4,
      nome: 'Café Torrado 500g',
      codigoInterno: '004',
      categoria: 'Bebidas',
      unidadeMedida: 'UN',
      precoCusto: 12.00,
      precoVenda: 18.90,
      permiteDesconto: true,
      estoque: 34,
      estoqueMinimo: 10,
      controlarEstoque: true,
      permiteEstoqueNegativo: false,
      ativo: true,
      destaque: false,
      novidade: false,
      promocao: false,
      emoji: '☕',
      preco: 18.90,
      unidadeEstoque: 'un'
    },
    {
      id: 5,
      nome: 'Arroz Tipo 1 5kg',
      codigoInterno: '005',
      categoria: 'Grãos',
      unidadeMedida: 'UN',
      precoCusto: 20.00,
      precoVenda: 28.50,
      permiteDesconto: true,
      estoque: 67,
      estoqueMinimo: 15,
      controlarEstoque: true,
      permiteEstoqueNegativo: false,
      ativo: true,
      destaque: false,
      novidade: false,
      promocao: false,
      emoji: '🍚',
      preco: 28.50,
      unidadeEstoque: 'un'
    },
    {
      id: 6,
      nome: 'Feijão Preto 1kg',
      codigoInterno: '006',
      categoria: 'Grãos',
      unidadeMedida: 'UN',
      precoCusto: 7.00,
      precoVenda: 9.99,
      permiteDesconto: true,
      estoque: 89,
      estoqueMinimo: 20,
      controlarEstoque: true,
      permiteEstoqueNegativo: false,
      ativo: true,
      destaque: false,
      novidade: false,
      promocao: false,
      emoji: '🫘',
      preco: 9.99,
      unidadeEstoque: 'un'
    },
    {
      id: 7,
      nome: 'Banana Prata (kg)',
      codigoInterno: '007',
      categoria: 'Frutas',
      unidadeMedida: 'KG',
      precoCusto: 4.50,
      precoVenda: 6.90,
      permiteDesconto: true,
      estoque: 25,
      estoqueMinimo: 10,
      controlarEstoque: true,
      permiteEstoqueNegativo: false,
      ativo: true,
      destaque: false,
      novidade: false,
      promocao: false,
      emoji: '🍌',
      preco: 6.90,
      unidadeEstoque: 'kg'
    },
    {
      id: 8,
      nome: 'Tomate Italiano (kg)',
      codigoInterno: '008',
      categoria: 'Verduras',
      unidadeMedida: 'KG',
      precoCusto: 6.00,
      precoVenda: 8.50,
      permiteDesconto: true,
      estoque: 42,
      estoqueMinimo: 15,
      controlarEstoque: true,
      permiteEstoqueNegativo: false,
      ativo: true,
      destaque: false,
      novidade: false,
      promocao: false,
      emoji: '🍅',
      preco: 8.50,
      unidadeEstoque: 'kg'
    }
  ]);

  // Carrinho atual
  carrinho = signal<CarrinhoItem[]>([]);

  // Histórico de vendas
  historicoVendas = signal<Venda[]>([
    {
      id: '#VENDA-001',
      data: new Date(2023, 8, 15, 10, 30),
      itens: [{ produtoId: 1, nome: 'Pão Francês', preco: 8.50, quantidade: 2, emoji: '🍞' }],
      total: 17.00,
      operador: 'João Silva',
      formaPagamento: 'dinheiro',
      status: 'concluida'
    },
    {
      id: '#VENDA-002',
      data: new Date(2023, 8, 15, 11, 15),
      itens: [
        { produtoId: 2, nome: 'Leite Integral 1L', preco: 5.99, quantidade: 4, emoji: '🥛' },
        { produtoId: 4, nome: 'Café Torrado 500g', preco: 18.90, quantidade: 1, emoji: '☕' }
      ],
      total: 42.86,
      operador: 'Maria Souza',
      formaPagamento: 'cartao',
      status: 'concluida'
    },
    {
      id: '#VENDA-003',
      data: new Date(2023, 8, 15, 12, 5),
      itens: [{ produtoId: 7, nome: 'Banana Prata (kg)', preco: 6.90, quantidade: 2, emoji: '🍌' }],
      total: 13.80,
      operador: 'João Silva',
      formaPagamento: 'dinheiro',
      status: 'concluida'
    }
  ]);

  // Computed values para o carrinho
  subtotal = computed(() =>
    this.carrinho().reduce((acc, item) => acc + item.preco * item.quantidade, 0)
  );

  totalItens = computed(() =>
    this.carrinho().reduce((acc, item) => acc + item.quantidade, 0)
  );

  total = computed(() => this.subtotal());

  private historicoService = inject(HistoricoService);
  private caixaService = inject(CaixaService);

  constructor() {}

  // Adicionar produto ao carrinho
  adicionarAoCarrinho(produto: Produto): void {
    if (produto.estoque <= 0) {
      console.warn('Produto sem estoque disponível');
      return;
    }

    this.carrinho.update(items => {
      const itemExistente = items.find(item => item.produtoId === produto.id);

      if (itemExistente) {
        return items.map(item =>
          item.produtoId === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        const novoItem: CarrinhoItem = {
          produtoId: produto.id,
          nome: produto.nome,
          preco: produto.precoVenda,
          quantidade: 1,
          emoji: produto.emoji || '📦'
        };
        return [...items, novoItem];
      }
    });
  }

  // Atualizar quantidade de item no carrinho
  atualizarQuantidade(item: CarrinhoItem, mudanca: number): void {
    this.carrinho.update(items => {
      const novaQuantidade = item.quantidade + mudanca;

      if (novaQuantidade <= 0) {
        return items.filter(i => i.produtoId !== item.produtoId);
      } else {
        return items.map(i =>
          i.produtoId === item.produtoId
            ? { ...i, quantidade: novaQuantidade }
            : i
        );
      }
    });
  }

  // Remover item do carrinho
  removerDoCarrinho(produtoId: number): void {
    this.carrinho.update(items => items.filter(item => item.produtoId !== produtoId));
  }

  // Limpar carrinho
  limparCarrinho(): void {
    this.carrinho.set([]);
  }

  // Finalizar venda
  finalizarVenda(formaPagamento: 'dinheiro' | 'cartao', operador: string = 'João Silva'): string {
    if (this.carrinho().length === 0) {
      throw new Error('Carrinho vazio');
    }

    const vendaId = this.gerarIdVenda();
    const numeroVenda = this.obterProximoNumeroVenda();
    const agora = new Date();

    // Criar venda para histórico antigo
    const novaVenda: Venda = {
      id: vendaId,
      data: agora,
      itens: [...this.carrinho()],
      total: this.total(),
      operador,
      formaPagamento,
      status: 'concluida'
    };

    // Criar venda para novo histórico
    const vendaHistorico: VendaHistorico = {
      id: vendaId,
      numeroVenda,
      data: agora,
      hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      operador,
      items: this.carrinho().map(item => ({
        id: item.produtoId,
        nome: item.nome,
        preco: item.preco,
        quantidade: item.quantidade,
        subtotal: item.preco * item.quantidade,
        emoji: item.emoji
      })),
      subtotal: this.subtotal(),
      desconto: 0,
      total: this.total(),
      formaPagamento,
      status: 'concluida'
    };

    // Adicionar venda ao histórico antigo
    this.historicoVendas.update(vendas => [novaVenda, ...vendas]);

    // Adicionar venda ao novo histórico
    this.historicoService.adicionarVenda(vendaHistorico);

    // Registrar venda no fluxo de caixa (SE houver caixa aberto)
    if (this.caixaService.hasCaixaAberto()) {
      const formaPagamentoCaixa = this.converterFormaPagamento(formaPagamento);
      try {
        this.caixaService.registrarVendaAutomatica(
          this.total(),
          formaPagamentoCaixa,
          numeroVenda
        );
      } catch (error) {
        console.warn('Erro ao registrar venda no caixa:', error);
      }
    }

    // Atualizar estoque dos produtos vendidos
    this.atualizarEstoque();

    // Limpar carrinho
    this.limparCarrinho();

    return numeroVenda;
  }

  // Converter forma de pagamento do PDV para o formato do Caixa
  private converterFormaPagamento(formaPagamento: 'dinheiro' | 'cartao'): FormaPagamento {
    if (formaPagamento === 'dinheiro') {
      return 'dinheiro';
    }
    // Para 'cartao' usar débito como padrão
    // No futuro, o backend pode especificar débito/crédito/pix
    return 'cartao_debito';
  }

  // Gerar ID único para venda
  private gerarIdVenda(): string {
    const proximoNumero = this.historicoVendas().length + 1;
    return `#VENDA-${proximoNumero.toString().padStart(3, '0')}`;
  }

  // Atualizar estoque após venda
  private atualizarEstoque(): void {
    this.produtos.update(produtos =>
      produtos.map(produto => {
        const itemVendido = this.carrinho().find(item => item.produtoId === produto.id);
        if (itemVendido) {
          return {
            ...produto,
            estoque: Math.max(0, produto.estoque - itemVendido.quantidade)
          };
        }
        return produto;
      })
    );
  }

  // Obter próximo número de venda
  obterProximoNumeroVenda(): string {
    const proximoNumero = this.historicoVendas().length + 1;
    return `#${proximoNumero.toString().padStart(7, '0')}`;
  }
}