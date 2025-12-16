export interface ProdutoEstoque {
  id: number;
  nome: string;
  codigoInterno: string;
  codigoBarras?: string;
  categoria: string;
  unidadeMedida: string;
  precoCusto: number;
  precoVenda: number;
  estoque: number;
  estoqueMinimo: number;
  fornecedor?: string;
  ativo: boolean;
}

export interface EstoqueFiltros {
  busca?: string;
  categoria?: string;
  estoqueBaixo?: boolean;
  semEstoque?: boolean;
}

export interface AlertaEstoque {
  produto: ProdutoEstoque;
  quantidadeFaltante: number;
  urgencia: 'critica' | 'media' | 'baixa';
}
