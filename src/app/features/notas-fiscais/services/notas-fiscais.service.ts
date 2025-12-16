import { Injectable, signal } from '@angular/core';
import { NotaFiscal, NotaFiscalForm, StatusNotaFiscal, TipoNotaFiscal, FiltrosNotaFiscal } from '../models/nota-fiscal.model';

@Injectable({
  providedIn: 'root'
})
export class NotasFiscaisService {
  // Estado das notas fiscais
  notasFiscais = signal<NotaFiscal[]>([
    {
      id: 1,
      numero: '000001',
      serie: '1',
      tipo: 'nfe',
      modelo: '55',
      chaveAcesso: '35240312345678901234550010000000011234567890',
      status: 'autorizada',
      finalidade: 'normal',
      dataEmissao: new Date(2024, 9, 1, 10, 30),
      dataAutorizacao: new Date(2024, 9, 1, 10, 35),
      clienteNome: 'João Silva',
      clienteCpfCnpj: '123.456.789-00',
      clienteEndereco: 'Rua A, 123',
      clienteCidade: 'São Paulo',
      clienteEstado: 'SP',
      valorProdutos: 1500.00,
      valorDesconto: 0,
      valorFrete: 50.00,
      valorOutros: 0,
      valorTotal: 1550.00,
      valorICMS: 270.00,
      valorPIS: 24.83,
      valorCOFINS: 114.40,
      produtos: [
        {
          codigo: '001',
          descricao: 'Produto A',
          ncm: '12345678',
          cfop: '5102',
          unidade: 'UN',
          quantidade: 10,
          valorUnitario: 150.00,
          valorTotal: 1500.00,
          icms: { cst: '00', aliquota: 18, valor: 270.00 },
          pis: { cst: '01', aliquota: 1.65, valor: 24.83 },
          cofins: { cst: '01', aliquota: 7.6, valor: 114.40 }
        }
      ],
      naturezaOperacao: 'Venda de mercadoria',
      protocolo: '123456789012345',
      xmlUrl: '/nfe/xml/000001.xml',
      pdfUrl: '/nfe/pdf/000001.pdf'
    },
    {
      id: 2,
      numero: '000002',
      serie: '1',
      tipo: 'nfce',
      modelo: '65',
      chaveAcesso: '35240312345678901234650010000000021234567891',
      status: 'autorizada',
      finalidade: 'normal',
      dataEmissao: new Date(2024, 9, 15, 14, 20),
      dataAutorizacao: new Date(2024, 9, 15, 14, 22),
      clienteNome: 'Maria Souza',
      clienteCpfCnpj: '987.654.321-00',
      valorProdutos: 250.00,
      valorDesconto: 10.00,
      valorFrete: 0,
      valorOutros: 0,
      valorTotal: 240.00,
      valorICMS: 43.20,
      produtos: [
        {
          codigo: '002',
          descricao: 'Produto B',
          ncm: '87654321',
          cfop: '5102',
          unidade: 'UN',
          quantidade: 5,
          valorUnitario: 50.00,
          valorTotal: 250.00,
          valorDesconto: 10.00,
          icms: { cst: '00', aliquota: 18, valor: 43.20 }
        }
      ],
      naturezaOperacao: 'Venda ao consumidor',
      protocolo: '987654321098765',
      xmlUrl: '/nfce/xml/000002.xml',
      pdfUrl: '/nfce/pdf/000002.pdf'
    },
    {
      id: 3,
      numero: '000003',
      serie: '1',
      tipo: 'nfe',
      modelo: '55',
      chaveAcesso: '35240312345678901234550010000000031234567892',
      status: 'cancelada',
      finalidade: 'normal',
      dataEmissao: new Date(2024, 9, 20, 9, 0),
      dataAutorizacao: new Date(2024, 9, 20, 9, 5),
      dataCancelamento: new Date(2024, 9, 21, 10, 0),
      clienteNome: 'Carlos Santos',
      clienteCpfCnpj: '12.345.678/0001-90',
      clienteEndereco: 'Av. B, 456',
      clienteCidade: 'Rio de Janeiro',
      clienteEstado: 'RJ',
      valorProdutos: 3000.00,
      valorDesconto: 0,
      valorFrete: 100.00,
      valorOutros: 0,
      valorTotal: 3100.00,
      valorICMS: 540.00,
      produtos: [
        {
          codigo: '003',
          descricao: 'Produto C',
          ncm: '11223344',
          cfop: '6102',
          unidade: 'UN',
          quantidade: 20,
          valorUnitario: 150.00,
          valorTotal: 3000.00,
          icms: { cst: '00', aliquota: 18, valor: 540.00 }
        }
      ],
      naturezaOperacao: 'Venda de mercadoria',
      protocolo: '111222333444555',
      motivoCancelamento: 'Erro no pedido',
      xmlUrl: '/nfe/xml/000003.xml',
      pdfUrl: '/nfe/pdf/000003.pdf'
    },
    {
      id: 4,
      numero: '000004',
      serie: '1',
      tipo: 'nfe',
      modelo: '55',
      chaveAcesso: '35240312345678901234550010000000041234567893',
      status: 'rejeitada',
      finalidade: 'normal',
      dataEmissao: new Date(2024, 9, 25, 16, 45),
      clienteNome: 'Ana Paula',
      clienteCpfCnpj: '98.765.432/0001-10',
      valorProdutos: 500.00,
      valorDesconto: 0,
      valorFrete: 0,
      valorOutros: 0,
      valorTotal: 500.00,
      produtos: [
        {
          codigo: '004',
          descricao: 'Produto D',
          ncm: '55667788',
          cfop: '5102',
          unidade: 'UN',
          quantidade: 10,
          valorUnitario: 50.00,
          valorTotal: 500.00
        }
      ],
      naturezaOperacao: 'Venda de mercadoria',
      motivoRejeicao: 'CNPJ do destinatário inválido'
    }
  ]);

  private proximoId = 5;
  private proximoNumero = 5;

  // Obter todas as notas fiscais
  getNotasFiscais(): NotaFiscal[] {
    return this.notasFiscais();
  }

  // Obter nota fiscal por ID
  getNotaFiscalById(id: number): NotaFiscal | undefined {
    return this.notasFiscais().find(nf => nf.id === id);
  }

  // Emitir nova nota fiscal
  emitirNotaFiscal(form: NotaFiscalForm): NotaFiscal {
    const numeroFormatado = this.proximoNumero.toString().padStart(6, '0');
    const chaveAcesso = this.gerarChaveAcesso(form.tipo, numeroFormatado);

    const novaNotaFiscal: NotaFiscal = {
      id: this.proximoId++,
      numero: numeroFormatado,
      serie: form.serie,
      tipo: form.tipo,
      modelo: form.tipo === 'nfe' ? '55' : '65',
      chaveAcesso,
      status: 'processando',
      finalidade: form.finalidade,
      dataEmissao: new Date(),
      dataSaida: form.dataSaida,
      clienteNome: form.clienteNome,
      clienteCpfCnpj: form.clienteCpfCnpj,
      clienteEndereco: form.clienteEndereco,
      clienteCidade: form.clienteCidade,
      clienteEstado: form.clienteEstado,
      valorProdutos: this.calcularValorProdutos(form.produtos),
      valorDesconto: this.calcularValorDesconto(form.produtos),
      valorFrete: 0,
      valorOutros: 0,
      valorTotal: this.calcularValorTotal(form.produtos),
      produtos: form.produtos,
      naturezaOperacao: form.naturezaOperacao,
      informacoesComplementares: form.informacoesComplementares
    };

    this.notasFiscais.update(notas => [...notas, novaNotaFiscal]);
    this.proximoNumero++;

    // Simular autorização após 2 segundos
    setTimeout(() => {
      this.simularAutorizacao(novaNotaFiscal.id);
    }, 2000);

    return novaNotaFiscal;
  }

  // Cancelar nota fiscal
  cancelarNotaFiscal(id: number, motivo: string): void {
    const nota = this.getNotaFiscalById(id);
    if (!nota) {
      throw new Error('Nota fiscal não encontrada');
    }

    if (nota.status !== 'autorizada') {
      throw new Error('Apenas notas autorizadas podem ser canceladas');
    }

    // Verificar prazo de cancelamento (24h)
    const horasDesdeAutorizacao = nota.dataAutorizacao
      ? (new Date().getTime() - nota.dataAutorizacao.getTime()) / (1000 * 60 * 60)
      : 999;

    if (horasDesdeAutorizacao > 24) {
      throw new Error('Prazo de cancelamento expirado (24 horas)');
    }

    this.notasFiscais.update(notas =>
      notas.map(nf =>
        nf.id === id
          ? {
              ...nf,
              status: 'cancelada' as StatusNotaFiscal,
              dataCancelamento: new Date(),
              motivoCancelamento: motivo
            }
          : nf
      )
    );
  }

  // Filtrar notas fiscais
  filtrarNotasFiscais(filtros: FiltrosNotaFiscal): NotaFiscal[] {
    let notas = this.notasFiscais();

    if (filtros.dataInicio) {
      notas = notas.filter(nf => nf.dataEmissao >= filtros.dataInicio!);
    }

    if (filtros.dataFim) {
      notas = notas.filter(nf => nf.dataEmissao <= filtros.dataFim!);
    }

    if (filtros.tipo) {
      notas = notas.filter(nf => nf.tipo === filtros.tipo);
    }

    if (filtros.status) {
      notas = notas.filter(nf => nf.status === filtros.status);
    }

    if (filtros.clienteNome) {
      const termo = filtros.clienteNome.toLowerCase();
      notas = notas.filter(nf => nf.clienteNome.toLowerCase().includes(termo));
    }

    if (filtros.numero) {
      notas = notas.filter(nf => nf.numero.includes(filtros.numero!));
    }

    return notas.sort((a, b) => b.dataEmissao.getTime() - a.dataEmissao.getTime());
  }

  // Buscar por chave de acesso
  buscarPorChaveAcesso(chave: string): NotaFiscal | undefined {
    return this.notasFiscais().find(nf => nf.chaveAcesso === chave);
  }

  // Calcular valores
  private calcularValorProdutos(produtos: any[]): number {
    return produtos.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
  }

  private calcularValorDesconto(produtos: any[]): number {
    return produtos.reduce((acc, p) => acc + (p.valorDesconto || 0), 0);
  }

  private calcularValorTotal(produtos: any[]): number {
    const valorProdutos = this.calcularValorProdutos(produtos);
    const valorDesconto = this.calcularValorDesconto(produtos);
    return valorProdutos - valorDesconto;
  }

  // Gerar chave de acesso (simplificado)
  private gerarChaveAcesso(tipo: TipoNotaFiscal, numero: string): string {
    const uf = '35'; // SP
    const ano = new Date().getFullYear().toString().slice(-2);
    const mes = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const cnpj = '12345678901234';
    const modelo = tipo === 'nfe' ? '55' : '65';
    const serie = '001';
    const numeroFormatado = numero.padStart(9, '0');
    const codigoNumerico = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');

    return `${uf}${ano}${mes}${cnpj}${modelo}${serie}${numeroFormatado}${codigoNumerico}`;
  }

  // Simular autorização da SEFAZ
  private simularAutorizacao(id: number): void {
    this.notasFiscais.update(notas =>
      notas.map(nf =>
        nf.id === id
          ? {
              ...nf,
              status: 'autorizada' as StatusNotaFiscal,
              dataAutorizacao: new Date(),
              protocolo: Math.floor(Math.random() * 1000000000000000)
                .toString()
                .padStart(15, '0')
            }
          : nf
      )
    );
  }
}
