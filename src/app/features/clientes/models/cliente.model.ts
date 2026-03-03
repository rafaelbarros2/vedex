export interface Cliente {
  id: number;
  nome: string;
  cpfCnpj: string;
  email?: string;
  telefone?: string;
  celular?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  dataCadastro?: Date;
  ativo: boolean;
  totalCompras?: number;
}

export interface ClienteFiltros {
  busca?: string;
  status?: 'todos' | 'ativo' | 'inativo';
}
