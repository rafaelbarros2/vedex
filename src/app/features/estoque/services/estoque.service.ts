import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ProdutoEstoque, EstoqueFiltros, AlertaEstoque } from '../models/estoque.model';
import { MovimentacaoEstoque, EntradaEstoque, SaidaEstoque, AjusteEstoque } from '../models/movimentacao.model';

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  // Estado reativo
  private _produtos = signal<ProdutoEstoque[]>([]);
  produtos = this._produtos.asReadonly();

  // Computed: produtos com estoque baixo
  produtosEstoqueBaixo = computed(() =>
    this._produtos().filter(p => p.estoque <= p.estoqueMinimo && p.ativo)
  );

  // Computed: produtos sem estoque
  produtosSemEstoque = computed(() =>
    this._produtos().filter(p => p.estoque === 0 && p.ativo)
  );

  // Computed: alertas de estoque ordenados por urgência
  alertasEstoque = computed((): AlertaEstoque[] => {
    const alertas: AlertaEstoque[] = [];
    this._produtos().forEach(produto => {
      if (!produto.ativo) return;
      if (produto.estoque <= produto.estoqueMinimo) {
        const quantidadeFaltante = produto.estoqueMinimo - produto.estoque;
        let urgencia: 'critica' | 'media' | 'baixa' = 'baixa';
        if (produto.estoque === 0) urgencia = 'critica';
        else if (produto.estoque <= produto.estoqueMinimo * 0.5) urgencia = 'media';
        alertas.push({ produto, quantidadeFaltante, urgencia });
      }
    });
    return alertas.sort((a, b) => {
      const order: Record<string, number> = { critica: 0, media: 1, baixa: 2 };
      return order[a.urgencia] - order[b.urgencia];
    });
  });

  constructor() {
    this.carregarProdutosAPI();
  }

  // === API METHODS ===

  carregarProdutosAPI(): void {
    this.http.get<any[]>(`${this.apiUrl}/produtos/ativos`).pipe(
      tap(dtos => this._produtos.set(dtos.map(d => this.converterProdutoDTO(d)))),
      catchError(err => {
        console.error('Erro ao carregar produtos do estoque:', err);
        return of([]);
      })
    ).subscribe();
  }

  registrarEntradaAPI(entrada: EntradaEstoque, usuarioId: number = 1): Observable<MovimentacaoEstoque> {
    const dto = {
      produtoId: entrada.produtoId,
      tipo: 'ENTRADA',
      quantidade: entrada.quantidade,
      motivo: 'Compra/Recebimento',
      observacao: entrada.observacao
    };
    return this.http.post<any>(`${this.apiUrl}/estoque/movimentacoes?usuarioId=${usuarioId}`, dto).pipe(
      tap(() => this.carregarProdutosAPI()),
      map(r => this.converterMovimentacaoDTO(r))
    );
  }

  registrarSaidaAPI(saida: SaidaEstoque, usuarioId: number = 1): Observable<MovimentacaoEstoque> {
    const dto = {
      produtoId: saida.produtoId,
      tipo: 'SAIDA',
      quantidade: saida.quantidade,
      motivo: saida.motivo,
      observacao: saida.observacao
    };
    return this.http.post<any>(`${this.apiUrl}/estoque/movimentacoes?usuarioId=${usuarioId}`, dto).pipe(
      tap(() => this.carregarProdutosAPI()),
      map(r => this.converterMovimentacaoDTO(r))
    );
  }

  registrarAjusteAPI(ajuste: AjusteEstoque, usuarioId: number = 1): Observable<MovimentacaoEstoque> {
    const produto = this._produtos().find(p => p.id === ajuste.produtoId);
    const quantidadeAtual = produto?.estoque ?? 0;
    const delta = Math.abs(ajuste.quantidadeNova - quantidadeAtual);
    if (delta === 0) {
      return throwError(() => new Error('Quantidade não foi alterada'));
    }
    const dto = {
      produtoId: ajuste.produtoId,
      tipo: 'AJUSTE',
      quantidade: delta,
      motivo: ajuste.motivo,
      observacao: ajuste.observacao
    };
    return this.http.post<any>(`${this.apiUrl}/estoque/movimentacoes?usuarioId=${usuarioId}`, dto).pipe(
      tap(() => this.carregarProdutosAPI()),
      map(r => this.converterMovimentacaoDTO(r))
    );
  }

  getHistoricoProdutoAPI(produtoId: number): Observable<MovimentacaoEstoque[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estoque/movimentacoes/produto/${produtoId}`).pipe(
      map(dtos => dtos.map(d => this.converterMovimentacaoDTO(d))),
      catchError(err => {
        console.error('Erro ao carregar histórico do produto:', err);
        return of([]);
      })
    );
  }

  getTodasMovimentacoesAPI(): Observable<MovimentacaoEstoque[]> {
    return this.http.post<any[]>(`${this.apiUrl}/estoque/historico`, {}).pipe(
      map(dtos => dtos.map(d => this.converterMovimentacaoDTO(d))),
      catchError(err => {
        console.error('Erro ao carregar movimentações:', err);
        return of([]);
      })
    );
  }

  // === HELPERS (síncronos, leem do signal local) ===

  listarProdutos(filtros?: EstoqueFiltros): ProdutoEstoque[] {
    let produtos = this._produtos();

    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      produtos = produtos.filter(p =>
        p.nome.toLowerCase().includes(busca) ||
        p.codigoInterno?.toLowerCase().includes(busca) ||
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

  getProdutoById(id: number): ProdutoEstoque | undefined {
    return this._produtos().find(p => p.id === id);
  }

  getCategorias(): string[] {
    const categorias = new Set(this._produtos().map(p => p.categoria).filter(Boolean));
    return Array.from(categorias).sort();
  }

  // === CONVERTERS ===

  private converterProdutoDTO(dto: any): ProdutoEstoque {
    return {
      id: dto.id,
      nome: dto.nome,
      codigoInterno: dto.codigo || '',
      codigoBarras: dto.ean,
      categoria: dto.categoria?.nome || dto.categoria || '',
      unidadeMedida: dto.unidade || 'UN',
      precoCusto: dto.precoCompra || 0,
      precoVenda: dto.preco || 0,
      estoque: dto.estoque || 0,
      estoqueMinimo: dto.estoqueMinimo || 0,
      ativo: dto.ativo !== false
    };
  }

  private converterMovimentacaoDTO(dto: any): MovimentacaoEstoque {
    return {
      id: dto.id,
      produtoId: dto.produto?.id || dto.produtoId,
      produtoNome: dto.produto?.nome || '',
      produtoCodigo: dto.produto?.codigo || '',
      tipo: (dto.tipo?.toLowerCase() || 'entrada') as any,
      quantidade: dto.quantidade,
      quantidadeAnterior: dto.estoqueAnterior || 0,
      quantidadeNova: dto.estoquePosterior || 0,
      motivo: dto.motivo || '',
      observacao: dto.observacao,
      usuario: dto.usuario?.nome || 'Sistema',
      data: new Date(dto.data)
    };
  }
}
