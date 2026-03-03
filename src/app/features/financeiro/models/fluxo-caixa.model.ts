export interface FluxoDiario {
  data: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

export interface FluxoCaixa {
  dataInicio: string;
  dataFim: string;
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  fluxoPorDia: FluxoDiario[];
}
