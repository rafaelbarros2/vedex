import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import {
  NotaFiscal,
  FiltrosNotaFiscal,
  StatusNotaFiscal,
  TipoNotaFiscal,
  ProdutoNotaFiscal
} from '../models/nota-fiscal.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotasFiscaisService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Signal privado — populado pelas chamadas API
  private _notasFiscais = signal<NotaFiscal[]>([]);

  // ===== API Methods =====

  listarTodasAPI(): Observable<NotaFiscal[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notas-fiscais/`).pipe(
      map(dtos => dtos.map(dto => this.converterResponseDTO(dto))),
      tap(notas => this._notasFiscais.set(notas)),
      catchError(err => {
        console.error('[NotasFiscais] Erro ao listar:', err);
        return of([]);
      })
    );
  }

  buscarPorIdAPI(id: number): Observable<NotaFiscal> {
    return this.http.get<any>(`${this.apiUrl}/notas-fiscais/${id}`).pipe(
      map(dto => this.converterResponseDTO(dto))
    );
  }

  emitirAPI(payload: {
    vendaId: number;
    tipo: TipoNotaFiscal;
    clienteId?: number;
    observacoes?: string;
  }): Observable<NotaFiscal> {
    const body = {
      vendaId: payload.vendaId,
      tipo: this.tipoParaEnum(payload.tipo),
      clienteId: payload.clienteId ?? null,
      observacoes: payload.observacoes ?? null
    };
    return this.http.post<any>(`${this.apiUrl}/notas-fiscais/emitir`, body).pipe(
      map(dto => this.converterResponseDTO(dto)),
      tap(nova => this._notasFiscais.update(notas => [nova, ...notas]))
    );
  }

  cancelarAPI(id: number, motivo: string): Observable<NotaFiscal> {
    return this.http.post<any>(
      `${this.apiUrl}/notas-fiscais/${id}/cancelar`,
      { motivo }
    ).pipe(
      map(dto => this.converterResponseDTO(dto)),
      tap(atualizada => {
        this._notasFiscais.update(notas =>
          notas.map(n => n.id === id ? atualizada : n)
        );
      })
    );
  }

  consultarAPI(filtros: FiltrosNotaFiscal): Observable<NotaFiscal[]> {
    const body: any = {};
    if (filtros.dataInicio) body.dataInicio = this.formatDateISO(filtros.dataInicio);
    if (filtros.dataFim)    body.dataFim    = this.formatDateISO(filtros.dataFim);
    if (filtros.tipo)       body.tipo       = this.tipoParaEnum(filtros.tipo);
    if (filtros.status)     body.status     = filtros.status.toUpperCase();
    if (filtros.numero)     body.numero     = filtros.numero;

    return this.http.post<any[]>(`${this.apiUrl}/notas-fiscais/consultar`, body).pipe(
      map(dtos => dtos.map(dto => this.converterResponseDTO(dto))),
      catchError(err => {
        console.error('[NotasFiscais] Erro ao consultar com filtros:', err);
        return of([]);
      })
    );
  }

  /** Carrega vendas para popular o formulário de emissão */
  buscarVendasDisponiveisAPI(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vendas`).pipe(
      catchError(err => {
        console.error('[NotasFiscais] Erro ao buscar vendas:', err);
        return of([]);
      })
    );
  }

  // ===== Sync helpers =====

  getNotasFiscais(): NotaFiscal[] {
    return this._notasFiscais();
  }

  getNotaFiscalById(id: number): NotaFiscal | undefined {
    return this._notasFiscais().find(nf => nf.id === id);
  }

  // ===== Converters =====

  /** Converte VendaResponseDTO (backend) → VendaParaNF (form) */
  converterVendaParaNF(dto: any): any {
    return {
      id: dto.id,
      numeroVenda: dto.numero ?? `VND-${dto.id}`,
      data: new Date(dto.dataVenda ?? dto.dataCriacao ?? Date.now()),
      clienteNome: dto.cliente?.nome,
      clienteCpfCnpj: dto.cliente?.cpfCnpj,
      clienteId: dto.cliente?.id,
      valorTotal: parseFloat(dto.total ?? dto.valorTotal ?? '0'),
      formaPagamento: dto.formaPagamento ?? '',
      produtos: (dto.itens ?? []).map((item: any) => ({
        nome: item.produto?.nome ?? item.descricao ?? '',
        quantidade: parseFloat(item.quantidade ?? '1'),
        valorUnitario: parseFloat(item.precoUnitario ?? item.valorUnitario ?? '0'),
        valorTotal: parseFloat(item.subtotal ?? item.valorTotal ?? '0')
      })),
      temNotaFiscal: !!(dto.notaFiscalId || dto.notaFiscal)
    };
  }

  /** Converte NotaFiscalResponseDTO (backend) → NotaFiscal (frontend) */
  private converterResponseDTO(dto: any): NotaFiscal {
    const tipoMap: Record<string, TipoNotaFiscal> = {
      NFE: 'nfe', NFCE: 'nfce', NFSE: 'nfse'
    };
    const statusMap: Record<string, StatusNotaFiscal> = {
      AUTORIZADA: 'autorizada',
      CANCELADA: 'cancelada',
      DENEGADA: 'denegada',
      REJEITADA: 'rejeitada',
      PROCESSANDO: 'processando',
      CONTINGENCIA: 'contingencia',
      PENDENTE: 'processando'
    };

    const tipo: TipoNotaFiscal = tipoMap[dto.tipo] ?? 'nfe';
    const status: StatusNotaFiscal = statusMap[dto.status] ?? 'processando';

    return {
      id: dto.id,
      numero: dto.numero ?? '',
      serie: dto.serie ?? '1',
      tipo,
      modelo: dto.modelo ?? (tipo === 'nfce' ? '65' : '55'),
      chaveAcesso: dto.chaveAcesso ?? '',
      status,
      finalidade: 'normal',
      dataEmissao: new Date(dto.dataEmissao),
      dataAutorizacao: dto.dataAutorizacao ? new Date(dto.dataAutorizacao) : undefined,
      dataCancelamento: dto.dataCancelamento ? new Date(dto.dataCancelamento) : undefined,
      clienteNome: dto.cliente?.nome ?? 'Consumidor',
      clienteCpfCnpj: dto.cliente?.cpfCnpj ?? '',
      clienteEndereco: dto.cliente?.endereco,
      clienteCidade: dto.cliente?.cidade,
      clienteEstado: dto.cliente?.estado,
      valorProdutos: parseFloat(dto.valorProdutos ?? '0'),
      valorDesconto: parseFloat(dto.valorDesconto ?? '0'),
      valorFrete: parseFloat(dto.valorFrete ?? '0'),
      valorOutros: 0,
      valorTotal: parseFloat(dto.valorTotal ?? '0'),
      valorICMS: dto.impostos ? parseFloat(dto.impostos.icms ?? '0') : undefined,
      valorIPI: dto.impostos ? parseFloat(dto.impostos.ipi ?? '0') : undefined,
      valorPIS: dto.impostos ? parseFloat(dto.impostos.pis ?? '0') : undefined,
      valorCOFINS: dto.impostos ? parseFloat(dto.impostos.cofins ?? '0') : undefined,
      produtos: (dto.itens ?? []).map((item: any) => this.converterItemDTO(item)),
      naturezaOperacao: 'Venda de mercadoria',
      protocolo: dto.protocolo,
      motivoCancelamento: dto.motivoCancelamento,
      motivoRejeicao: dto.motivoRejeicao,
      xmlUrl: dto.xmlUrl,
      pdfUrl: dto.pdfUrl
    };
  }

  private converterItemDTO(item: any): ProdutoNotaFiscal {
    return {
      codigo: item.codigo ?? item.produto?.codigo ?? '',
      descricao: item.descricao ?? item.produto?.nome ?? '',
      ncm: item.ncm ?? '',
      cfop: item.cfop ?? '5102',
      unidade: item.unidade ?? 'UN',
      quantidade: parseFloat(item.quantidade ?? '0'),
      valorUnitario: parseFloat(item.valorUnitario ?? '0'),
      valorTotal: parseFloat(item.valorTotal ?? '0'),
      icms: item.impostos?.icms ? {
        cst: '00',
        aliquota: parseFloat(item.impostos.icms.aliquota ?? '18'),
        valor: parseFloat(item.impostos.icms.valor ?? '0')
      } : undefined,
      pis: item.impostos?.pis ? {
        cst: '01',
        aliquota: parseFloat(item.impostos.pis.aliquota ?? '1.65'),
        valor: parseFloat(item.impostos.pis.valor ?? '0')
      } : undefined,
      cofins: item.impostos?.cofins ? {
        cst: '01',
        aliquota: parseFloat(item.impostos.cofins.aliquota ?? '7.6'),
        valor: parseFloat(item.impostos.cofins.valor ?? '0')
      } : undefined
    };
  }

  // ===== Helpers privados =====

  private tipoParaEnum(tipo: TipoNotaFiscal): string {
    const map: Record<TipoNotaFiscal, string> = { nfe: 'NFE', nfce: 'NFCE', nfse: 'NFSE' };
    return map[tipo];
  }

  private formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
