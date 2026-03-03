export interface VendaHistorico {
  id: string;
  numeroVenda: string;
  data: Date;
  hora: string;
  operador: string;
  cliente?: string;
  items: VendaHistoricoItem[];
  subtotal: number;
  desconto: number;
  total: number;
  formaPagamento: 'dinheiro' | 'cartao' | 'cartao_debito' | 'cartao_credito' | 'pix';
  valorRecebido?: number;
  troco?: number;
  status: 'concluida' | 'cancelada' | 'pendente';
}

export interface VendaHistoricoItem {
  id: number;
  nome: string;
  codigo?: string;
  categoria?: string;
  preco: number;
  quantidade: number;
  subtotal: number;
  emoji: string;
}

export interface FiltroHistorico {
  dataInicio?: Date;
  dataFim?: Date;
  formaPagamento?: 'dinheiro' | 'cartao' | 'cartao_debito' | 'cartao_credito' | 'pix' | 'todas';
  status?: 'concluida' | 'cancelada' | 'pendente' | 'todas';
  operador?: string;
  numeroVenda?: string;
}