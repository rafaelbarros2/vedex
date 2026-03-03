import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Produto } from '../../../shared/models/produto.model';
import { CarrinhoItem } from '../../../shared/models/carrinho.model';
import { Venda } from '../../../shared/models/venda.model';
import { VendaHistorico } from '../../../shared/models/venda-historico.model';
import { HistoricoService } from './historico.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PdvService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Produtos carregados da API
  produtos = signal<Produto[]>([]);

  // Carrinho atual
  carrinho = signal<CarrinhoItem[]>([]);

  // Histórico de vendas (local, para UI do PDV)
  historicoVendas = signal<Venda[]>([]);

  // Computed values para o carrinho
  subtotal = computed(() =>
    this.carrinho().reduce((acc, item) => acc + item.preco * item.quantidade, 0)
  );

  totalItens = computed(() =>
    this.carrinho().reduce((acc, item) => acc + item.quantidade, 0)
  );

  total = computed(() => this.subtotal());

  private historicoService = inject(HistoricoService);

  constructor() {
    this.carregarProdutosAPI();
  }

  // === API METHODS ===

  carregarProdutosAPI(): void {
    this.http.get<any[]>(`${this.apiUrl}/produtos/ativos`).pipe(
      tap(dtos => this.produtos.set(dtos.map(d => this.converterProdutoDTO(d)))),
      catchError(err => {
        console.error('Erro ao carregar produtos para o PDV:', err);
        return of([]);
      })
    ).subscribe();
  }

  finalizarVendaAPI(
    formaPagamento: 'dinheiro' | 'cartao' | 'cartao_debito' | 'cartao_credito' | 'pix',
    valorPago: number
  ): Observable<string> {
    const itensCarrinho = this.carrinho();
    if (itensCarrinho.length === 0) {
      return throwError(() => new Error('Carrinho vazio'));
    }

    const formaPagMap: Record<string, string> = {
      dinheiro: 'DINHEIRO',
      cartao: 'CARTAO_DEBITO',
      cartao_debito: 'CARTAO_DEBITO',
      cartao_credito: 'CARTAO_CREDITO',
      pix: 'PIX'
    };

    const payload = {
      itens: itensCarrinho.map(item => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: item.preco
      })),
      formaPagamento: formaPagMap[formaPagamento] || 'DINHEIRO',
      valorPago
    };

    return this.http.post<any>(`${this.apiUrl}/vendas`, payload).pipe(
      tap(vendaDto => {
        // Adicionar ao histórico visual do PDV
        const agora = new Date();
        const vendaHistorico: VendaHistorico = {
          id: `#${vendaDto.numeroVenda}`,
          numeroVenda: vendaDto.numeroVenda,
          data: agora,
          hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          operador: vendaDto.usuario?.nome || 'Operador',
          items: itensCarrinho.map(item => ({
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
        this.historicoService.adicionarVenda(vendaHistorico);
        this.limparCarrinho();
      }),
      map(vendaDto => vendaDto.numeroVenda || vendaDto.id?.toString() || 'OK')
    );
  }

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

  // Obter número de venda antecipado (para exibir no dialog de pagamento)
  obterProximoNumeroVenda(): string {
    return `#PDV-${Date.now().toString().slice(-6)}`;
  }

  // === CONVERTER ===

  private converterProdutoDTO(dto: any): Produto {
    return {
      id: dto.id,
      nome: dto.nome,
      codigoInterno: dto.codigo || '',
      codigoBarras: dto.ean,
      categoria: dto.categoria?.nome || dto.categoria || '',
      unidadeMedida: (dto.unidade || 'UN') as any,
      precoCusto: dto.precoCompra || 0,
      precoVenda: dto.preco || 0,
      preco: dto.preco || 0,
      estoque: dto.estoque || 0,
      estoqueMinimo: dto.estoqueMinimo || 0,
      ativo: dto.ativo !== false,
      permiteDesconto: true,
      controlarEstoque: true,
      permiteEstoqueNegativo: false,
      destaque: false,
      novidade: false,
      promocao: false,
      emoji: '📦'
    };
  }
}