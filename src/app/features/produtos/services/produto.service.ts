import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Produto, ProdutoFiltros, Categoria, Fornecedor } from '../../../shared/models/produto.model';
import { environment } from '../../../../environments/environment';
import { CategoriaService, CategoriaDTO } from './categoria.service';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private http = inject(HttpClient);
  private categoriaService = inject(CategoriaService);
  private apiUrl = `${environment.apiUrl}/produtos`;

  // State signals
  private produtos = signal<Produto[]>([]);
  private categorias = signal<Categoria[]>([]);
  private fornecedores = signal<Fornecedor[]>([]);

  constructor() {
    // Carrega produtos da API ao inicializar
    this.carregarProdutosAPI();
  }

  // Headers (X-Tenant-ID não é mais necessário - extraído do JWT pelo backend)
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Métodos API
  private carregarProdutosAPI(): void {
    this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap(produtos => {
          console.log('Produtos carregados da API:', produtos);
          const produtosConvertidos = produtos.map(p => this.converterDTOParaModel(p));
          this.produtos.set(produtosConvertidos);
        }),
        catchError(error => {
          console.error('Erro ao carregar produtos da API, usando dados mockados:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  listarTodosAPI(): Observable<Produto[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap(produtos => {
          const produtosConvertidos = produtos.map(p => this.converterDTOParaModel(p));
          this.produtos.set(produtosConvertidos);
        }),
        catchError(error => {
          console.error('Erro ao listar produtos:', error);
          this.produtos.set([]); // Limpa lista em caso de erro
          throw error; // Propaga erro para componente tratar
        })
      );
  }

  buscarPorIdAPI(id: number): Observable<Produto> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(produto => console.log('Produto carregado:', produto)),
        catchError(error => {
          console.error('Erro ao buscar produto:', error);
          throw error; // Propaga erro para componente tratar
        })
      );
  }

  criarAPI(produto: Partial<Produto>): Observable<Produto> {
    const dto = this.converterModelParaDTO(produto, true); // true = isCreate
    return this.http.post<any>(this.apiUrl, dto, { headers: this.getHeaders() })
      .pipe(
        tap(novoProduto => {
          const produtoConvertido = this.converterDTOParaModel(novoProduto);
          this.produtos.update(produtos => [...produtos, produtoConvertido]);
        }),
        catchError(error => {
          console.error('Erro ao criar produto:', error);
          throw error;
        })
      );
  }

  atualizarAPI(id: number, produto: Partial<Produto>): Observable<Produto> {
    const dto = this.converterModelParaDTO(produto, false); // false = isUpdate
    return this.http.put<any>(`${this.apiUrl}/${id}`, dto, { headers: this.getHeaders() })
      .pipe(
        tap(produtoAtualizado => {
          const produtoConvertido = this.converterDTOParaModel(produtoAtualizado);
          this.produtos.update(produtos =>
            produtos.map(p => p.id === id ? produtoConvertido : p)
          );
        }),
        catchError(error => {
          console.error('Erro ao atualizar produto:', error);
          throw error;
        })
      );
  }

  excluirAPI(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          this.produtos.update(produtos => produtos.filter(p => p.id !== id));
        }),
        catchError(error => {
          console.error('Erro ao excluir produto:', error);
          throw error;
        })
      );
  }

  // Conversores DTO <-> Model
  private converterDTOParaModel(dto: any): Produto {
    return {
      id: dto.id,
      nome: dto.nome,
      codigoInterno: dto.codigo || '',
      codigoBarras: dto.ean,
      categoria: dto.categoria?.nome || '',
      unidadeMedida: dto.unidade || 'UN',
      descricao: dto.descricao,
      precoCusto: dto.precoCompra || 0,
      precoVenda: dto.preco || 0,
      margemLucro: dto.margemLucro || 0,
      permiteDesconto: true,
      estoque: dto.estoque || 0,
      estoqueMinimo: dto.estoqueMinimo || 0,
      controlarEstoque: true,
      permiteEstoqueNegativo: false,
      ativo: dto.ativo !== false,
      destaque: false,
      novidade: false,
      promocao: false,
      ncm: dto.ncm,
      criadoEm: dto.dataCadastro ? new Date(dto.dataCadastro) : new Date(),
      atualizadoEm: new Date()
    };
  }

  private converterModelParaDTO(produto: Partial<Produto>, isCreate: boolean = false): any {
    // Busca o ID da categoria pelo nome
    let categoriaId = null;
    if (produto.categoria) {
      const categorias = this.categoriaService.getCategorias();
      const categoriaEncontrada = categorias.find(c => c.nome === produto.categoria);
      categoriaId = categoriaEncontrada?.id || null;
    }

    const dto: any = {
      codigo: produto.codigoInterno,
      nome: produto.nome,
      descricao: produto.descricao,
      categoriaId: categoriaId,
      preco: produto.precoVenda,
      precoCompra: produto.precoCusto,
      estoqueMinimo: produto.estoqueMinimo,
      unidade: produto.unidadeMedida || 'UN',
      ncm: produto.ncm,
      ean: produto.codigoBarras,
      ativo: produto.ativo !== false
    };

    // No create, usa estoqueInicial; no update, não envia estoque
    if (isCreate) {
      dto.estoqueInicial = produto.estoque || 0;
    }

    return dto;
  }

  // Getters
  getProdutos() {
    return this.produtos();
  }

  getCategorias() {
    return this.categorias();
  }

  getFornecedores() {
    return this.fornecedores();
  }

  getProdutoById(id: number): Produto | undefined {
    return this.produtos().find(p => p.id === id);
  }

  // Utilitários
  calcularMargemLucro(custo: number, venda: number): number {
    if (custo === 0) return 0;
    return ((venda - custo) / custo) * 100;
  }

  calcularMarkup(custo: number, venda: number): number {
    if (custo === 0) return 0;
    return (venda / custo);
  }

  gerarCodigoInterno(): string {
    const ultimoProduto = this.produtos().reduce((max, p) => {
      const codigo = parseInt(p.codigoInterno);
      return codigo > max ? codigo : max;
    }, 0);
    return (ultimoProduto + 1).toString().padStart(6, '0');
  }

  getSubcategorias(categoria: string): string[] {
    const cat = this.categorias().find(c => c.nome === categoria);
    return cat?.subcategorias || [];
  }
}
