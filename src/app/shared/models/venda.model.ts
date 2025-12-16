export interface Venda {
  id: string;
  data: Date;
  total: number;
  clienteId?: number;
  itens: VendaItem[];
  formaPagamento: string;
  status: 'pendente' | 'concluida' | 'cancelada';
  operador: string;
}

export interface VendaItem {
  produtoId: number;
  nome: string;
  preco: number;
  quantidade: number;
  emoji: string;
}