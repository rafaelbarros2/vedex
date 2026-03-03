import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ContaPagar } from '../models/conta-pagar.model';

@Injectable({ providedIn: 'root' })
export class ContaPagarService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/financeiro/contas-pagar`;

  private _contasPagar = signal<ContaPagar[]>([]);
  readonly contasPagar = this._contasPagar.asReadonly();

  listarTodosAPI(): Observable<ContaPagar[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(dtos => dtos.map(dto => this.converterDTOParaModel(dto))),
      tap(lista => this._contasPagar.set(lista)),
      catchError(err => {
        console.error('[ContasPagar] Erro ao listar:', err);
        return of([]);
      })
    );
  }

  buscarPorIdAPI(id: number): Observable<ContaPagar> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.converterDTOParaModel(dto))
    );
  }

  criarAPI(form: Partial<ContaPagar>): Observable<ContaPagar> {
    const body = this.converterModelParaDTO(form);
    return this.http.post<any>(this.apiUrl, body).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      tap(nova => this._contasPagar.update(lista => [nova, ...lista]))
    );
  }

  atualizarAPI(id: number, form: Partial<ContaPagar>): Observable<ContaPagar> {
    const body = this.converterModelParaDTO(form);
    return this.http.put<any>(`${this.apiUrl}/${id}`, body).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      tap(atualizada => {
        this._contasPagar.update(lista =>
          lista.map(c => c.id === id ? atualizada : c)
        );
      })
    );
  }

  excluirAPI(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this._contasPagar.update(lista => lista.filter(c => c.id !== id)))
    );
  }

  marcarComoPagoAPI(id: number, dataPagamento?: string): Observable<ContaPagar> {
    const body = dataPagamento ? { dataPagamento } : {};
    return this.http.patch<any>(`${this.apiUrl}/${id}/pagar`, body).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      tap(atualizada => {
        this._contasPagar.update(lista =>
          lista.map(c => c.id === id ? atualizada : c)
        );
      })
    );
  }

  cancelarAPI(id: number): Observable<ContaPagar> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/cancelar`, {}).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      tap(atualizada => {
        this._contasPagar.update(lista =>
          lista.map(c => c.id === id ? atualizada : c)
        );
      })
    );
  }

  converterDTOParaModel(dto: any): ContaPagar {
    return {
      id: dto.id,
      descricao: dto.descricao ?? '',
      valor: dto.valor ?? 0,
      dataVencimento: dto.dataVencimento ?? '',
      dataPagamento: dto.dataPagamento,
      status: dto.status ?? 'PENDENTE',
      statusLabel: dto.statusLabel,
      categoria: dto.categoria,
      observacoes: dto.observacoes,
      ativo: dto.ativo ?? true,
      criadoEm: dto.criadoEm,
    };
  }

  private converterModelParaDTO(form: Partial<ContaPagar>): any {
    const dto: any = {};
    if (form.descricao !== undefined) dto.descricao = form.descricao;
    if (form.valor !== undefined) dto.valor = form.valor;
    if (form.dataVencimento !== undefined) dto.dataVencimento = form.dataVencimento;
    if (form.categoria !== undefined) dto.categoria = form.categoria;
    if (form.observacoes !== undefined) dto.observacoes = form.observacoes;
    return dto;
  }
}
