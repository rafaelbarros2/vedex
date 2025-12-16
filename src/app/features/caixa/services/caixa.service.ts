import { Injectable, inject, signal, computed } from '@angular/core';
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

  constructor() {
    this.verificarCaixaAberto();
  }

  // Verificar se existe caixa aberto ao iniciar
  verificarCaixaAberto() {
    this.http.get<Caixa>(`${this.apiUrl}/atual`).pipe(
      catchError(() => of(null))
    ).subscribe(caixa => {
      if (caixa) {
        this.caixaAtual.set(caixa);
        this.carregarLancamentos(caixa.id);
      }
    });
  }

  // Carregar lançamentos de um caixa
  carregarLancamentos(caixaId: number) {
    this.http.get<Lancamento[]>(`${this.apiUrl}/${caixaId}/lancamentos`)
      .subscribe(lancamentos => {
        this.lancamentos.set(lancamentos);
      });
  }

  // Computed: resumo do caixa atual
  resumoCaixaAtual = computed(() => {
    const caixa = this.caixaAtual();
    if (!caixa) return null;

    const lancamentosDoCaixa = this.lancamentos();

    const totalEntradas = lancamentosDoCaixa
      .filter(l => l.tipo === 'entrada')
      .reduce((acc, l) => acc + l.valor, 0);

    const totalSaidas = lancamentosDoCaixa
      .filter(l => l.tipo === 'saida')
      .reduce((acc, l) => acc + l.valor, 0);

    const totalVendas = lancamentosDoCaixa
      .filter(l => l.categoria === 'Vendas')
      .reduce((acc, l) => acc + l.valor, 0);

    const totalSuprimentos = lancamentosDoCaixa
      .filter(l => l.categoria === 'Suprimento')
      .reduce((acc, l) => acc + l.valor, 0);

    const totalSangrias = lancamentosDoCaixa
      .filter(l => l.categoria === 'Sangria')
      .reduce((acc, l) => acc + l.valor, 0);

    const saldoAtual = caixa.valorAbertura + totalEntradas - totalSaidas;

    // Vendas por forma de pagamento
    const vendasPorFormaPagamento = {
      dinheiro: lancamentosDoCaixa
        .filter(l => l.categoria === 'Vendas' && l.formaPagamento === 'dinheiro')
        .reduce((acc, l) => acc + l.valor, 0),
      cartao_debito: lancamentosDoCaixa
        .filter(l => l.categoria === 'Vendas' && l.formaPagamento === 'cartao_debito')
        .reduce((acc, l) => acc + l.valor, 0),
      cartao_credito: lancamentosDoCaixa
        .filter(l => l.categoria === 'Vendas' && l.formaPagamento === 'cartao_credito')
        .reduce((acc, l) => acc + l.valor, 0),
      pix: lancamentosDoCaixa
        .filter(l => l.categoria === 'Vendas' && l.formaPagamento === 'pix')
        .reduce((acc, l) => acc + l.valor, 0)
    };

    const resumo: ResumoCaixa = {
      totalEntradas,
      totalSaidas,
      totalVendas,
      totalSuprimentos,
      totalSangrias,
      saldoAtual,
      vendasPorFormaPagamento
    };

    return resumo;
  });

  // Abrir caixa
  abrirCaixa(valorAbertura: number, observacoes?: string): Observable<Caixa> {
    return this.http.post<Caixa>(`${this.apiUrl}/abrir`, { valorAbertura, observacoes }).pipe(
      tap(caixa => {
        this.caixaAtual.set(caixa);
        this.lancamentos.set([]);
      })
    );
  }

  // Fechar caixa
  fecharCaixa(valorContado: number, observacoes?: string): Observable<Caixa> {
    const caixa = this.caixaAtual();
    if (!caixa) throw new Error('Não há caixa aberto');

    return this.http.post<Caixa>(`${this.apiUrl}/${caixa.id}/fechar`, {
      valorFechamentoContado: valorContado,
      observacoes
    }).pipe(
      tap(caixaFechado => {
        this.caixaAtual.set(null);
        this.lancamentos.set([]);
        // Atualizar histórico se necessário
      })
    );
  }

  // Registrar lançamento manual
  registrarLancamento(
    descricao: string,
    valor: number,
    tipo: TipoLancamento,
    categoria: string,
    formaPagamento: FormaPagamento
  ): Observable<Lancamento> {
    const caixa = this.caixaAtual();
    if (!caixa) throw new Error('Não há caixa aberto');

    const payload = {
      descricao,
      valor,
      tipo,
      categoria,
      formaPagamento,
      caixaId: caixa.id
    };

    return this.http.post<Lancamento>(`${this.apiUrl}/${caixa.id}/lancamentos`, payload).pipe(
      tap(lancamento => {
        this.lancamentos.update(l => [lancamento, ...l]);
      })
    );
  }

  // Registrar suprimento
  registrarSuprimento(valor: number, descricao: string): Observable<Lancamento> {
    return this.registrarLancamento(
      descricao || 'Suprimento de caixa',
      valor,
      'entrada',
      'Suprimento',
      'dinheiro'
    );
  }

  // Registrar sangria
  registrarSangria(valor: number, descricao: string): Observable<Lancamento> {
    return this.registrarLancamento(
      descricao || 'Sangria de caixa',
      valor,
      'saida',
      'Sangria',
      'dinheiro'
    );
  }

  // Registrar venda automática (PDV)
  registrarVendaAutomatica(valor: number, formaPagamento: FormaPagamento, numeroVenda: string): Observable<Lancamento> {
    return this.registrarLancamento(
      `Venda ${numeroVenda}`,
      valor,
      'entrada',
      'Vendas',
      formaPagamento
    );
  }

  // Obter lançamentos do caixa atual
  getLancamentosCaixaAtual(): Lancamento[] {
    return this.lancamentos();
  }

  // Obter lançamentos com filtros (Client-side filtering for now)
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

  // Obter histórico de caixas (paginado ou filtrado no futuro)
  buscarHistoricoCaixas(dataInicio?: Date, dataFim?: Date): Observable<Caixa[]> {
    let params = new HttpParams();
    if (dataInicio) params = params.set('dataInicio', dataInicio.toISOString().split('T')[0]);
    if (dataFim) params = params.set('dataFim', dataFim.toISOString().split('T')[0]);

    return this.http.get<Caixa[]>(this.apiUrl, { params }).pipe(
      tap(caixas => this.caixas.set(caixas))
    );
  }

  // Verificar se há caixa aberto
  hasCaixaAberto(): boolean {
    return this.caixaAtual() !== null;
  }
}
