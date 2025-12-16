export type TipoNotaFiscal = 'nfe' | 'nfce' | 'nfse';
export type StatusNotaFiscal = 'autorizada' | 'cancelada' | 'denegada' | 'rejeitada' | 'processando' | 'contingencia';
export type FinalidadeNota = 'normal' | 'complementar' | 'ajuste' | 'devolucao';

export interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  tipo: TipoNotaFiscal;
  modelo: string; // '55' para NF-e, '65' para NFC-e
  chaveAcesso: string;
  status: StatusNotaFiscal;
  finalidade: FinalidadeNota;

  // Datas
  dataEmissao: Date;
  dataSaida?: Date;
  dataAutorizacao?: Date;
  dataCancelamento?: Date;

  // Cliente/Destinatário
  clienteNome: string;
  clienteCpfCnpj: string;
  clienteEndereco?: string;
  clienteCidade?: string;
  clienteEstado?: string;

  // Valores
  valorProdutos: number;
  valorDesconto: number;
  valorFrete: number;
  valorOutros: number;
  valorTotal: number;

  // Impostos
  valorICMS?: number;
  valorIPI?: number;
  valorPIS?: number;
  valorCOFINS?: number;

  // Produtos
  produtos: ProdutoNotaFiscal[];

  // Informações adicionais
  naturezaOperacao: string;
  informacoesComplementares?: string;

  // Protocolo SEFAZ
  protocolo?: string;
  motivoCancelamento?: string;
  motivoRejeicao?: string;

  // Arquivos
  xmlUrl?: string;
  pdfUrl?: string;
}

export interface ProdutoNotaFiscal {
  codigo: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  valorDesconto?: number;

  // Impostos
  icms?: {
    cst: string;
    aliquota: number;
    valor: number;
  };
  ipi?: {
    cst: string;
    aliquota: number;
    valor: number;
  };
  pis?: {
    cst: string;
    aliquota: number;
    valor: number;
  };
  cofins?: {
    cst: string;
    aliquota: number;
    valor: number;
  };
}

export interface NotaFiscalForm {
  tipo: TipoNotaFiscal;
  serie: string;
  finalidade: FinalidadeNota;
  naturezaOperacao: string;
  clienteNome: string;
  clienteCpfCnpj: string;
  clienteEndereco?: string;
  clienteCidade?: string;
  clienteEstado?: string;
  dataSaida?: Date;
  produtos: ProdutoNotaFiscal[];
  informacoesComplementares?: string;
}

export interface FiltrosNotaFiscal {
  dataInicio?: Date;
  dataFim?: Date;
  tipo?: TipoNotaFiscal;
  status?: StatusNotaFiscal;
  clienteNome?: string;
  numero?: string;
}
