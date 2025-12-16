export type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste';

export interface MovimentacaoEstoque {
  id: number;
  produtoId: number;
  produtoNome: string;
  produtoCodigo: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  quantidadeAnterior: number;
  quantidadeNova: number;
  motivo: string;
  observacao?: string;
  usuario: string;
  data: Date;
  precoCusto?: number; // Para entradas
  fornecedor?: string; // Para entradas
}

export interface MovimentacaoFiltros {
  produtoId?: number;
  tipo?: TipoMovimentacao;
  dataInicio?: Date;
  dataFim?: Date;
  usuario?: string;
}

export interface EntradaEstoque {
  produtoId: number;
  quantidade: number;
  precoCusto?: number;
  fornecedor?: string;
  observacao?: string;
}

export interface SaidaEstoque {
  produtoId: number;
  quantidade: number;
  motivo: string;
  observacao?: string;
}

export interface AjusteEstoque {
  produtoId: number;
  quantidadeNova: number;
  motivo: string;
  observacao?: string;
}
