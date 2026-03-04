export type TipoLancamento = 'entrada' | 'saida';
export type FormaPagamento = 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'pix';
export type StatusCaixa = 'aberto' | 'fechado';

export interface Lancamento {
  id: number;
  descricao: string;
  valor: number;
  data: Date;
  tipo: TipoLancamento;
  categoria: string;
  formaPagamento: FormaPagamento;
  automatico: boolean; // true para vendas automáticas do PDV
  caixaId: number;
  usuario: string;
}

export interface Caixa {
  id: number;
  dataAbertura: Date;
  dataFechamento?: Date;
  valorAbertura: number; // Fundo de troco inicial
  valorFechamentoEsperado?: number;
  valorFechamentoContado?: number;
  diferenca?: number; // Sobra (+) ou Falta (-)
  status: StatusCaixa;
  operador: string;
  identificadorPdv?: string;
  observacoes?: string;
}

export interface ResumoCaixa {
  totalEntradas: number;
  totalSaidas: number;
  totalVendas: number;
  totalSuprimentos: number;
  totalSangrias: number;
  saldoAtual: number;
  vendasPorFormaPagamento: {
    dinheiro: number;
    cartao_debito: number;
    cartao_credito: number;
    pix: number;
  };
}

export interface LancamentoFiltros {
  dataInicio?: Date;
  dataFim?: Date;
  tipo?: TipoLancamento;
  categoria?: string;
  formaPagamento?: FormaPagamento;
}
