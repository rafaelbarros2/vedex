export interface ContaPagar {
  id: number;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'VENCIDO';
  statusLabel?: string;
  categoria?: string;
  observacoes?: string;
  ativo: boolean;
  criadoEm?: string;
}

export interface ContaPagarFiltros {
  busca?: string;
  status?: string;
}
