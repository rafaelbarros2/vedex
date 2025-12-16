export interface Produto {
  id: number;

  // Informações Básicas
  nome: string;
  codigoInterno: string;
  codigoBarras?: string;
  categoria: string;
  subcategoria?: string;
  unidadeMedida: 'UN' | 'KG' | 'LT' | 'CX' | 'PCT';
  descricao?: string;
  marca?: string;
  modelo?: string;

  // Preços e Custos
  precoCusto: number;
  precoVenda: number;
  margemLucro?: number; // Calculado
  markup?: number; // Calculado
  descontoMaximo?: number;
  permiteDesconto: boolean;

  // Estoque
  estoque: number;
  estoqueMinimo: number;
  estoqueMaximo?: number;
  localizacaoEstoque?: string;
  controlarEstoque: boolean;
  permiteEstoqueNegativo: boolean;

  // Informações Fiscais
  ncm?: string;
  cest?: string;
  cfop?: string;
  origemMercadoria?: string;
  cst?: string;
  aliquotaIcms?: number;
  aliquotaPis?: number;
  aliquotaCofins?: number;

  // Fornecedor
  fornecedorId?: number;
  fornecedorNome?: string;
  codigoFornecedor?: string;
  tempoReposicao?: number;

  // Dimensões e Peso
  pesoBruto?: number;
  pesoLiquido?: number;
  altura?: number;
  largura?: number;
  profundidade?: number;

  // Imagens
  imagemPrincipal?: string;
  imagensAdicionais?: string[];

  // Status
  ativo: boolean;
  destaque: boolean;
  novidade: boolean;
  promocao: boolean;

  // Metadados
  criadoEm?: Date;
  atualizadoEm?: Date;

  // Legado (manter compatibilidade)
  emoji?: string;
  preco?: number; // Alias para precoVenda
  unidadeEstoque?: string; // Alias para unidadeMedida
  codigo?: string; // Alias para codigoInterno
}

export interface ProdutoFiltros {
  busca?: string;
  categoria?: string;
  status?: 'todos' | 'ativo' | 'inativo';
  estoque?: 'todos' | 'em-estoque' | 'estoque-baixo' | 'sem-estoque';
  fornecedor?: number;
}

export interface Categoria {
  id: number;
  nome: string;
  subcategorias?: string[];
}

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string;
  contato?: string;
}