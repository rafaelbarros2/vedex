export type FormaPagamentoVenda = 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'pix';
export type StatusVenda = 'concluida' | 'cancelada' | 'devolucao' | 'devolvida';

export interface VendaCliente {
  id: number;
  nome: string;
  cpfCnpj?: string;
}

export interface VendaUsuario {
  id: number;
  nome: string;
}

export interface ItemVendaDetalhe {
  id: number;
  produto: {
    id: number;
    nome: string;
    codigo: string;
  };
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  subtotal: number;
}

export interface VendaDetalhe {
  id: number;
  numeroVenda: string;
  cliente?: VendaCliente;
  usuario?: VendaUsuario;
  dataVenda: Date;
  subtotal: number;
  desconto: number;
  total: number;
  formaPagamento: FormaPagamentoVenda;
  valorPago: number;
  troco: number;
  status: StatusVenda;
  itens: ItemVendaDetalhe[];
  notaFiscalId?: number;
  observacoes?: string;
}

export interface VendaFiltros {
  busca?: string;
  status?: StatusVenda | 'todos';
  formaPagamento?: FormaPagamentoVenda | 'todos';
}
