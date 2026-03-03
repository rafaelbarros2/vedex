export interface ContaReceber {
  id: number;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataRecebimento?: string;
  status: 'PENDENTE' | 'RECEBIDO' | 'CANCELADO' | 'VENCIDO';
  statusLabel?: string;
  categoria?: string;
  clienteId?: number;
  clienteNome?: string;
  observacoes?: string;
  ativo: boolean;
  criadoEm?: string;
}

export interface ContaReceberFiltros {
  busca?: string;
  status?: string;
}
