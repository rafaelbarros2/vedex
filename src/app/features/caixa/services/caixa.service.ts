import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { Caixa, Lancamento, ResumoCaixa, TipoLancamento, FormaPagamento, StatusCaixa, LancamentoFiltros } from '../models/caixa.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CaixaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/caixa`;

  // Estado do caixa atual
  caixaAtual = signal<Caixa | null>(null);

  // Indica se a verificação inicial do caixa já foi concluída (async)
  caixaLoaded = signal<boolean>(false);

  // Resumo do caixa atual (vindo da API)
  resumoCaixaAtual = signal<ResumoCaixa | null>(null);

  // Histórico de caixas
  caixas = signal<Caixa[]>([]);

  // Lançamentos do caixa atual
  lancamentos = signal<Lancamento[]>([]);

  // Categorias disponíveis
  categorias = [
    'Vendas',
    'Suprimento',
    'Sangria',
    'Despesas Fixas',
    'Fornecedores',
    'Salários',
    'Impostos',
    'Outras Despesas',
    'Outras Receitas'
  ];

  // TODO: substituir por AuthService.currentUser().id quando disponível
  private usuarioId = 1;

  constructor() {
    this.verificarCaixaAberto();
  }

  // Verificar se existe caixa aberto ao iniciar
  verificarCaixaAberto() {
    this.http.get<any>(`${this.apiUrl}/aberto/usuario/${this.usuarioId}`).pipe(
      catchError(() => of(null))
    ).subscribe(dto => {
      if (dto) {
        const caixa = this.converterCaixaDTO(dto);
        this.caixaAtual.set(caixa);
        this.carregarLancamentos(caixa.id);
        this.carregarResumo(caixa.id);
      }
      // Sinaliza que a verificação inicial foi concluída (independente do resultado)
      this.caixaLoaded.set(true);
    });
  }

  // Carregar lançamentos de um caixa
  carregarLancamentos(caixaId: number) {
    this.http.get<any[]>(`${this.apiUrl}/${caixaId}/lancamentos`).pipe(
      catchError(() => of([]))
    ).subscribe(dtos => {
      this.lancamentos.set(dtos.map(d => this.converterLancamentoDTO(d)));
    });
  }

  // Carregar resumo do caixa via API
  carregarResumo(caixaId: number) {
    this.http.get<any>(`${this.apiUrl}/${caixaId}/resumo`).pipe(
      catchError(() => of(null))
    ).subscribe(dto => {
      if (dto) {
        this.resumoCaixaAtual.set(this.converterResumoDTO(dto));
      }
    });
  }

  // Abrir caixa
  abrirCaixa(valorAbertura: number, identificadorPdv?: string, observacoes?: string): Observable<Caixa> {
    return this.http.post<any>(
      `${this.apiUrl}/abrir?usuarioId=${this.usuarioId}`,
      { valorAbertura, identificadorPdv, observacoes }
    ).pipe(
      map(dto => this.converterCaixaDTO(dto)),
      tap(caixa => {
        this.caixaAtual.set(caixa);
        this.lancamentos.set([]);
        this.resumoCaixaAtual.set(null);
      })
    );
  }

  // Fechar caixa
  fecharCaixa(valorContado: number, observacoes?: string): Observable<Caixa> {
    const caixa = this.caixaAtual();
    if (!caixa) throw new Error('Não há caixa aberto');

    return this.http.post<any>(
      `${this.apiUrl}/${caixa.id}/fechar?usuarioId=${this.usuarioId}`,
      { valorFechamentoContado: valorContado, observacoes }
    ).pipe(
      map(dto => this.converterCaixaDTO(dto)),
      tap(() => {
        this.caixaAtual.set(null);
        this.lancamentos.set([]);
        this.resumoCaixaAtual.set(null);
      })
    );
  }

  // Registrar lançamento manual genérico
  registrarLancamento(
    descricao: string,
    valor: number,
    tipo: TipoLancamento,
    categoria: string,
    formaPagamento: FormaPagamento
  ): Observable<Lancamento> {
    const tipoBackend = tipo === 'entrada' ? 'ENTRADA' : 'SAIDA';
    const formaPagBackend: Record<FormaPagamento, string> = {
      dinheiro: 'DINHEIRO',
      cartao_debito: 'CARTAO_DEBITO',
      cartao_credito: 'CARTAO_CREDITO',
      pix: 'PIX'
    };
    const caixaId = this.caixaAtual()?.id;
    const payload = {
      tipo: tipoBackend,
      categoria,
      descricao,
      valor,
      formaPagamento: formaPagBackend[formaPagamento] || 'DINHEIRO'
    };
    return this.http.post<any>(
      `${this.apiUrl}/lancamentos?usuarioId=${this.usuarioId}`,
      payload
    ).pipe(
      map(dto => this.converterLancamentoDTO(dto)),
      tap(lancamento => {
        this.lancamentos.update(l => [lancamento, ...l]);
        if (caixaId) this.carregarResumo(caixaId);
      })
    );
  }

  // Registrar suprimento
  registrarSuprimento(valor: number, descricao: string): Observable<Lancamento> {
    const caixaId = this.caixaAtual()?.id;
    const payload = {
      tipo: 'ENTRADA',
      categoria: 'Suprimento',
      descricao: descricao || 'Suprimento de caixa',
      valor,
      formaPagamento: 'DINHEIRO'
    };
    return this.http.post<any>(
      `${this.apiUrl}/lancamentos?usuarioId=${this.usuarioId}`,
      payload
    ).pipe(
      map(dto => this.converterLancamentoDTO(dto)),
      tap(lancamento => {
        this.lancamentos.update(l => [lancamento, ...l]);
        if (caixaId) this.carregarResumo(caixaId);
      })
    );
  }

  // Registrar sangria
  registrarSangria(valor: number, descricao: string): Observable<Lancamento> {
    const caixaId = this.caixaAtual()?.id;
    const payload = {
      tipo: 'SAIDA',
      categoria: 'Sangria',
      descricao: descricao || 'Sangria de caixa',
      valor,
      formaPagamento: 'DINHEIRO'
    };
    return this.http.post<any>(
      `${this.apiUrl}/lancamentos?usuarioId=${this.usuarioId}`,
      payload
    ).pipe(
      map(dto => this.converterLancamentoDTO(dto)),
      tap(lancamento => {
        this.lancamentos.update(l => [lancamento, ...l]);
        if (caixaId) this.carregarResumo(caixaId);
      })
    );
  }

  // Obter lançamentos do caixa atual
  getLancamentosCaixaAtual(): Lancamento[] {
    return this.lancamentos();
  }

  // Obter lançamentos com filtros (Client-side filtering)
  getLancamentosFiltrados(filtros: LancamentoFiltros): Lancamento[] {
    let lancamentos = this.lancamentos();

    if (filtros.dataInicio) {
      lancamentos = lancamentos.filter(l => new Date(l.data) >= new Date(filtros.dataInicio!));
    }
    if (filtros.dataFim) {
      lancamentos = lancamentos.filter(l => new Date(l.data) <= new Date(filtros.dataFim!));
    }
    if (filtros.tipo) {
      lancamentos = lancamentos.filter(l => l.tipo === filtros.tipo);
    }
    if (filtros.categoria) {
      lancamentos = lancamentos.filter(l => l.categoria === filtros.categoria);
    }
    if (filtros.formaPagamento) {
      lancamentos = lancamentos.filter(l => l.formaPagamento === filtros.formaPagamento);
    }

    return lancamentos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  // Buscar histórico de caixas por período
  buscarHistoricoCaixas(dataInicio?: Date, dataFim?: Date): Observable<Caixa[]> {
    let params = new HttpParams();
    if (dataInicio) params = params.set('dataInicio', dataInicio.toISOString().split('T')[0]);
    if (dataFim) params = params.set('dataFim', dataFim.toISOString().split('T')[0]);

    return this.http.get<any[]>(`${this.apiUrl}/periodo`, { params }).pipe(
      map(dtos => dtos.map(d => this.converterCaixaDTO(d))),
      tap(caixas => this.caixas.set(caixas)),
      catchError(() => of([]))
    );
  }

  // Verificar se há caixa aberto
  hasCaixaAberto(): boolean {
    return this.caixaAtual() !== null;
  }

  // === CONVERTERS DTO → Model ===

  private converterCaixaDTO(dto: any): Caixa {
    return {
      id: dto.id,
      dataAbertura: new Date(dto.dataAbertura),
      dataFechamento: dto.dataFechamento ? new Date(dto.dataFechamento) : undefined,
      valorAbertura: parseFloat(dto.valorAbertura) || 0,
      valorFechamentoEsperado: dto.valorFechamentoEsperado ? parseFloat(dto.valorFechamentoEsperado) : undefined,
      valorFechamentoContado: dto.valorFechamentoContado ? parseFloat(dto.valorFechamentoContado) : undefined,
      diferenca: dto.diferenca ? parseFloat(dto.diferenca) : undefined,
      status: dto.status?.toLowerCase() as StatusCaixa || 'aberto',
      operador: dto.operador?.nome || 'Operador',
      identificadorPdv: dto.identificadorPdv || undefined,
      observacoes: dto.observacoes
    };
  }

  private converterLancamentoDTO(dto: any): Lancamento {
    const tipoMap: Record<string, TipoLancamento> = {
      ENTRADA: 'entrada',
      SAIDA: 'saida'
    };
    const formaPagMap: Record<string, FormaPagamento> = {
      DINHEIRO: 'dinheiro',
      CARTAO_DEBITO: 'cartao_debito',
      CARTAO_CREDITO: 'cartao_credito',
      PIX: 'pix'
    };
    return {
      id: dto.id,
      descricao: dto.descricao || '',
      valor: parseFloat(dto.valor) || 0,
      data: new Date(dto.data),
      tipo: tipoMap[dto.tipo] || 'entrada',
      categoria: dto.categoria || '',
      formaPagamento: formaPagMap[dto.formaPagamento] || 'dinheiro',
      automatico: dto.automatico || false,
      caixaId: dto.caixa?.id || 0,
      usuario: dto.usuario?.nome || 'Sistema'
    };
  }

  private converterResumoDTO(dto: any): ResumoCaixa {
    const vendasPorForma = dto.vendasPorFormaPagamento || {};
    return {
      totalEntradas: parseFloat(dto.totalEntradas) || 0,
      totalSaidas: parseFloat(dto.totalSaidas) || 0,
      totalVendas: parseFloat(dto.totalVendas) || 0,
      totalSuprimentos: parseFloat(dto.totalSuprimentos) || 0,
      totalSangrias: parseFloat(dto.totalSangrias) || 0,
      saldoAtual: parseFloat(dto.saldoAtual) || 0,
      vendasPorFormaPagamento: {
        dinheiro: parseFloat(vendasPorForma['DINHEIRO'] ?? vendasPorForma['dinheiro'] ?? 0) || 0,
        cartao_debito: parseFloat(vendasPorForma['CARTAO_DEBITO'] ?? vendasPorForma['cartao_debito'] ?? 0) || 0,
        cartao_credito: parseFloat(vendasPorForma['CARTAO_CREDITO'] ?? vendasPorForma['cartao_credito'] ?? 0) || 0,
        pix: parseFloat(vendasPorForma['PIX'] ?? vendasPorForma['pix'] ?? 0) || 0
      }
    };
  }
}
