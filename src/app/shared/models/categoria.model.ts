export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  quantidadeProdutos?: number;
}

export interface CategoriaFiltros {
  busca?: string;
  status?: 'todos' | 'ativo' | 'inativo';
}
