import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Categoria } from '../../../shared/models/categoria.model';

export interface CategoriaDTO {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  quantidadeProdutos?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categorias`;

  // Cache de categorias
  private categorias = signal<CategoriaDTO[]>([]);

  constructor() {
    // Carrega categorias ao inicializar
    this.carregarCategoriasAPI();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  private carregarCategoriasAPI(): void {
    this.listarTodasAPI().subscribe();
  }

  listarTodasAPI(): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap(categorias => {
          console.log('Categorias carregadas da API:', categorias);
          this.categorias.set(categorias);
        }),
        catchError(error => {
          console.error('Erro ao carregar categorias:', error);
          // Retorna categorias mockadas em caso de erro
          const mockCategorias: CategoriaDTO[] = [
            { id: 1, nome: 'Alimentos', descricao: 'Produtos alimentícios', ativo: true },
            { id: 2, nome: 'Bebidas', descricao: 'Bebidas em geral', ativo: true },
            { id: 3, nome: 'Higiene', descricao: 'Produtos de higiene', ativo: true },
            { id: 4, nome: 'Laticínios', descricao: 'Produtos derivados do leite', ativo: true }
          ];
          this.categorias.set(mockCategorias);
          return of(mockCategorias);
        })
      );
  }

  listarAtivasAPI(): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(`${this.apiUrl}/ativas`, { headers: this.getHeaders() })
      .pipe(
        tap(categorias => {
          console.log('Categorias ativas:', categorias);
        }),
        catchError(error => {
          console.error('Erro ao carregar categorias ativas:', error);
          return of(this.categorias().filter(c => c.ativo));
        })
      );
  }

  buscarPorIdAPI(id: number): Observable<CategoriaDTO> {
    return this.http.get<CategoriaDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar categoria:', error);
          throw error;
        })
      );
  }

  criarAPI(categoria: Partial<CategoriaDTO>): Observable<CategoriaDTO> {
    return this.http.post<CategoriaDTO>(this.apiUrl, categoria, { headers: this.getHeaders() })
      .pipe(
        tap(novaCategoria => {
          this.categorias.update(cats => [...cats, novaCategoria]);
        }),
        catchError(error => {
          console.error('Erro ao criar categoria:', error);
          throw error;
        })
      );
  }

  atualizarAPI(id: number, categoria: Partial<CategoriaDTO>): Observable<CategoriaDTO> {
    return this.http.put<CategoriaDTO>(`${this.apiUrl}/${id}`, categoria, { headers: this.getHeaders() })
      .pipe(
        tap(categoriaAtualizada => {
          this.categorias.update(cats =>
            cats.map(c => c.id === id ? categoriaAtualizada : c)
          );
        }),
        catchError(error => {
          console.error('Erro ao atualizar categoria:', error);
          throw error;
        })
      );
  }

  excluirAPI(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          this.categorias.update(cats => cats.filter(c => c.id !== id));
        }),
        catchError(error => {
          console.error('Erro ao excluir categoria:', error);
          throw error;
        })
      );
  }

  // Getter para categorias em cache
  getCategorias(): CategoriaDTO[] {
    return this.categorias();
  }
}
