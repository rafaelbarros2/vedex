import { Injectable, signal, computed } from '@angular/core';
import { ProdutoEstoque, EstoqueFiltros, AlertaEstoque } from '../models/estoque.model';
import { MovimentacaoEstoque, TipoMovimentacao, EntradaEstoque, SaidaEstoque, AjusteEstoque } from '../models/movimentacao.model';

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {
  // Produtos com dados de estoque
  produtos = signal<ProdutoEstoque[]>([
    {
      id: 1,
      nome: 'Pão Francês',
      codigoInterno: '001',
      codigoBarras: '7891234567890',
      categoria: 'Padaria',
      unidadeMedida: 'UN',
      precoCusto: 6.00,
      precoVenda: 8.50,
      estoque: 45,
      estoqueMinimo: 50,
      fornecedor: 'Padaria Central',
      ativo: true
    },
    {
      id: 2,
      nome: 'Leite Integral 1L',
      codigoInterno: '002',
      codigoBarras: '7891234567891',
      categoria: 'Laticínios',
      unidadeMedida: 'UN',
      precoCusto: 4.00,
      precoVenda: 5.99,
      estoque: 120,
      estoqueMinimo: 20,
      fornecedor: 'Laticínios Bom Leite',
      ativo: true
    },
    {
      id: 3,
      nome: 'Queijo Minas Frescal (kg)',
      codigoInterno: '003',
      codigoBarras: '7891234567892',
      categoria: 'Laticínios',
      unidadeMedida: 'KG',
      precoCusto: 25.00,
      precoVenda: 32.90,
      estoque: 18,
      estoqueMinimo: 5,
      fornecedor: 'Laticínios Bom Leite',
      ativo: true
    },
    {
      id: 4,
      nome: 'Café Torrado 500g',
      codigoInterno: '004',
      codigoBarras: '7891234567893',
      categoria: 'Bebidas',
      unidadeMedida: 'UN',
      precoCusto: 12.00,
      precoVenda: 18.90,
      estoque: 5,
      estoqueMinimo: 10,
      fornecedor: 'Café Premium Ltda',
      ativo: true
    },
    {
      id: 5,
      nome: 'Arroz Tipo 1 5kg',
      codigoInterno: '005',
      codigoBarras: '7891234567894',
      categoria: 'Grãos',
      unidadeMedida: 'UN',
      precoCusto: 20.00,
      precoVenda: 28.50,
      estoque: 0,
      estoqueMinimo: 15,
      fornecedor: 'Distribuidora Grãos Brasil',
      ativo: true
    },
    {
      id: 6,
      nome: 'Feijão Preto 1kg',
      codigoInterno: '006',
      codigoBarras: '7891234567895',
      categoria: 'Grãos',
      unidadeMedida: 'UN',
      precoCusto: 7.00,
      precoVenda: 9.99,
      estoque: 89,
      estoqueMinimo: 20,
      fornecedor: 'Distribuidora Grãos Brasil',
      ativo: true
    },
    {
      id: 7,
      nome: 'Banana Prata (kg)',
      codigoInterno: '007',
      codigoBarras: '7891234567896',
      categoria: 'Frutas',
      unidadeMedida: 'KG',
      precoCusto: 4.50,
      precoVenda: 6.90,
      estoque: 25,
      estoqueMinimo: 10,
      fornecedor: 'Hortifruti Fresco',
      ativo: true
    },
    {
      id: 8,
      nome: 'Tomate Italiano (kg)',
      codigoInterno: '008',
      codigoBarras: '7891234567897',
      categoria: 'Verduras',
      unidadeMedida: 'KG',
      precoCusto: 6.00,
      precoVenda: 8.50,
      estoque: 2,
      estoqueMinimo: 15,
      fornecedor: 'Hortifruti Fresco',
      ativo: true
    }
  ]);

  // Histórico de movimentações
  movimentacoes = signal<MovimentacaoEstoque[]>([
    {
      id: 1,
      produtoId: 1,
      produtoNome: 'Pão Francês',
      produtoCodigo: '001',
      tipo: 'entrada',
      quantidade: 100,
      quantidadeAnterior: 0,
      quantidadeNova: 100,
      motivo: 'Compra inicial',
      usuario: 'João Silva',
      data: new Date(2025, 0, 1, 8, 0),
      precoCusto: 6.00,
      fornecedor: 'Padaria Central'
    },
    {
      id: 2,
      produtoId: 1,
      produtoNome: 'Pão Francês',
      produtoCodigo: '001',
      tipo: 'saida',
      quantidade: 55,
      quantidadeAnterior: 100,
      quantidadeNova: 45,
      motivo: 'Venda automática',
      usuario: 'Sistema PDV',
      data: new Date(2025, 0, 1, 18, 30)
    },
    {
      id: 3,
      produtoId: 4,
      produtoNome: 'Café Torrado 500g',
      produtoCodigo: '004',
      tipo: 'ajuste',
      quantidade: 5,
      quantidadeAnterior: 10,
      quantidadeNova: 5,
      motivo: 'Avaria - Embalagens danificadas',
      observacao: '5 unidades com embalagens rasgadas',
      usuario: 'Maria Souza',
      data: new Date(2025, 0, 1, 16, 0)
    },
    {
      id: 4,
      produtoId: 5,
      produtoNome: 'Arroz Tipo 1 5kg',
      produtoCodigo: '005',
      tipo: 'saida',
      quantidade: 67,
      quantidadeAnterior: 67,
      quantidadeNova: 0,
      motivo: 'Venda automática',
      usuario: 'Sistema PDV',
      data: new Date(2025, 0, 1, 19, 0)
    }
  ]);

  private proximoIdMovimentacao = 5;

  // Computed: produtos com estoque baixo
  produtosEstoqueBaixo = computed(() => {
    return this.produtos().filter(p => p.estoque <= p.estoqueMinimo && p.ativo);
  });

  // Computed: produtos sem estoque
  produtosSemEstoque = computed(() => {
    return this.produtos().filter(p => p.estoque === 0 && p.ativo);
  });

  // Computed: alertas de estoque
  alertasEstoque = computed(() => {
    const alertas: AlertaEstoque[] = [];

    this.produtos().forEach(produto => {
      if (!produto.ativo) return;

      if (produto.estoque <= produto.estoqueMinimo) {
        const quantidadeFaltante = produto.estoqueMinimo - produto.estoque;
        let urgencia: 'critica' | 'media' | 'baixa' = 'baixa';

        if (produto.estoque === 0) {
          urgencia = 'critica';
        } else if (produto.estoque <= produto.estoqueMinimo * 0.5) {
          urgencia = 'media';
        }

        alertas.push({
          produto,
          quantidadeFaltante,
          urgencia
        });
      }
    });

    return alertas.sort((a, b) => {
      const urgenciaOrder = { critica: 0, media: 1, baixa: 2 };
      return urgenciaOrder[a.urgencia] - urgenciaOrder[b.urgencia];
    });
  });

  // Listar produtos com filtros
  listarProdutos(filtros?: EstoqueFiltros): ProdutoEstoque[] {
    let produtos = this.produtos();

    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      produtos = produtos.filter(p =>
        p.nome.toLowerCase().includes(busca) ||
        p.codigoInterno.toLowerCase().includes(busca) ||
        p.codigoBarras?.toLowerCase().includes(busca)
      );
    }

    if (filtros?.categoria) {
      produtos = produtos.filter(p => p.categoria === filtros.categoria);
    }

    if (filtros?.estoqueBaixo) {
      produtos = produtos.filter(p => p.estoque <= p.estoqueMinimo);
    }

    if (filtros?.semEstoque) {
      produtos = produtos.filter(p => p.estoque === 0);
    }

    return produtos;
  }

  // Buscar produto por ID
  getProdutoById(id: number): ProdutoEstoque | undefined {
    return this.produtos().find(p => p.id === id);
  }

  // Registrar entrada de estoque
  registrarEntrada(entrada: EntradaEstoque, usuario: string = 'Sistema'): void {
    const produto = this.getProdutoById(entrada.produtoId);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    const quantidadeAnterior = produto.estoque;
    const quantidadeNova = quantidadeAnterior + entrada.quantidade;

    // Atualizar estoque do produto
    this.produtos.update(produtos =>
      produtos.map(p => {
        if (p.id === entrada.produtoId) {
          const atualizado: ProdutoEstoque = {
            ...p,
            estoque: quantidadeNova
          };
          // Atualizar preço de custo se fornecido
          if (entrada.precoCusto !== undefined) {
            atualizado.precoCusto = entrada.precoCusto;
          }
          return atualizado;
        }
        return p;
      })
    );

    // Registrar movimentação
    const movimentacao: MovimentacaoEstoque = {
      id: this.proximoIdMovimentacao++,
      produtoId: entrada.produtoId,
      produtoNome: produto.nome,
      produtoCodigo: produto.codigoInterno,
      tipo: 'entrada',
      quantidade: entrada.quantidade,
      quantidadeAnterior,
      quantidadeNova,
      motivo: 'Compra/Recebimento',
      observacao: entrada.observacao,
      usuario,
      data: new Date(),
      precoCusto: entrada.precoCusto,
      fornecedor: entrada.fornecedor
    };

    this.movimentacoes.update(movs => [movimentacao, ...movs]);
  }

  // Registrar saída de estoque (manual)
  registrarSaida(saida: SaidaEstoque, usuario: string = 'Sistema'): void {
    const produto = this.getProdutoById(saida.produtoId);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    if (produto.estoque < saida.quantidade) {
      throw new Error('Quantidade em estoque insuficiente');
    }

    const quantidadeAnterior = produto.estoque;
    const quantidadeNova = quantidadeAnterior - saida.quantidade;

    // Atualizar estoque do produto
    this.produtos.update(produtos =>
      produtos.map(p =>
        p.id === saida.produtoId
          ? { ...p, estoque: quantidadeNova }
          : p
      )
    );

    // Registrar movimentação
    const movimentacao: MovimentacaoEstoque = {
      id: this.proximoIdMovimentacao++,
      produtoId: saida.produtoId,
      produtoNome: produto.nome,
      produtoCodigo: produto.codigoInterno,
      tipo: 'saida',
      quantidade: saida.quantidade,
      quantidadeAnterior,
      quantidadeNova,
      motivo: saida.motivo,
      observacao: saida.observacao,
      usuario,
      data: new Date()
    };

    this.movimentacoes.update(movs => [movimentacao, ...movs]);
  }

  // Registrar ajuste de estoque
  registrarAjuste(ajuste: AjusteEstoque, usuario: string = 'Sistema'): void {
    const produto = this.getProdutoById(ajuste.produtoId);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    if (ajuste.quantidadeNova < 0) {
      throw new Error('Quantidade não pode ser negativa');
    }

    const quantidadeAnterior = produto.estoque;
    const diferenca = ajuste.quantidadeNova - quantidadeAnterior;

    // Atualizar estoque do produto
    this.produtos.update(produtos =>
      produtos.map(p =>
        p.id === ajuste.produtoId
          ? { ...p, estoque: ajuste.quantidadeNova }
          : p
      )
    );

    // Registrar movimentação
    const movimentacao: MovimentacaoEstoque = {
      id: this.proximoIdMovimentacao++,
      produtoId: ajuste.produtoId,
      produtoNome: produto.nome,
      produtoCodigo: produto.codigoInterno,
      tipo: 'ajuste',
      quantidade: Math.abs(diferenca),
      quantidadeAnterior,
      quantidadeNova: ajuste.quantidadeNova,
      motivo: ajuste.motivo,
      observacao: ajuste.observacao,
      usuario,
      data: new Date()
    };

    this.movimentacoes.update(movs => [movimentacao, ...movs]);
  }

  // Registrar saída automática por venda (chamado pelo PDV)
  registrarSaidaVenda(produtoId: number, quantidade: number): void {
    this.registrarSaida(
      {
        produtoId,
        quantidade,
        motivo: 'Venda automática'
      },
      'Sistema PDV'
    );
  }

  // Obter histórico de movimentações de um produto
  getHistoricoProduto(produtoId: number): MovimentacaoEstoque[] {
    return this.movimentacoes()
      .filter(m => m.produtoId === produtoId)
      .sort((a, b) => b.data.getTime() - a.data.getTime());
  }

  // Obter todas as movimentações
  getTodasMovimentacoes(): MovimentacaoEstoque[] {
    return this.movimentacoes().sort((a, b) => b.data.getTime() - a.data.getTime());
  }

  // Obter categorias únicas
  getCategorias(): string[] {
    const categorias = new Set(this.produtos().map(p => p.categoria));
    return Array.from(categorias).sort();
  }
}
