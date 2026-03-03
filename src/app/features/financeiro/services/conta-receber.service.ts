import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ContaReceber } from '../models/conta-receber.model';

@Injectable({ providedIn: 'root' })
export class ContaReceberService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/financeiro/contas-receber`;

  private _contasReceber = signal<ContaReceber[]>([]);
  readonly contasReceber = this._contasReceber.asReadonly();

  listarTodosAPI(): Observable<ContaReceber[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(dtos => dtos.map(dto => this.converterDTOParaModel(dto))),
      tap(lista => this._contasReceber.set(lista)),
      catchError(err => {
        console.error('[ContasReceber] Erro ao listar:', err);
        return of([]);
      })
    );
  }

  buscarPorIdAPI(id: number): Observable<ContaReceber> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.converterDTOParaModel(dto))
    );
  }

  criarAPI(form: Partial<ContaReceber>): Observable<ContaReceber> {
    const body = this.converterModelParaDTO(form);
    return this.http.post<any>(this.apiUrl, body).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      tap(nova => this._contasReceber.update(lista => [nova, ...lista]))
    );
  }

  atualizarAPI(id: number, form: Partial<ContaReceber>): Observable<ContaReceber> {
    const body = this.converterModelParaDTO(form);
    return this.http.put<any>(`${this.apiUrl}/${id}`, body).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      tap(atualizada => {
        this._contasReceber.update(lista =>
          lista.map(c => c.id === id ? atualizada : c)
        );
      })
    );
  }

  excluirAPI(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this._contasReceber.update(lista => lista.filter(c => c.id !== id)))
    );
  }

  marcarComoRecebidoAPI(id: number, dataRecebimento?: string): Observable<ContaReceber> {
    const body = dataRecebimento ? { dataRecebimento } : {};
    return this.http.patch<any>(`${this.apiUrl}/${id}/receber`, body).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      tap(atualizada => {
        this._contasReceber.update(lista =>
          lista.map(c => c.id === id ? atualizada : c)
        );
      })
    );
  }

  cancelarAPI(id: number): Observable<ContaReceber> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/cancelar`, {}).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      tap(atualizada => {
        this._contasReceber.update(lista =>
          lista.map(c => c.id === id ? atualizada : c)
        );
      })
    );
  }

  converterDTOParaModel(dto: any): ContaReceber {
    return {
      id: dto.id,
      descricao: dto.descricao ?? '',
      valor: dto.valor ?? 0,
      dataVencimento: dto.dataVencimento ?? '',
      dataRecebimento: dto.dataRecebimento,
      status: dto.status ?? 'PENDENTE',
      statusLabel: dto.statusLabel,
      categoria: dto.categoria,
      clienteId: dto.clienteId,
      clienteNome: dto.clienteNome,
      observacoes: dto.observacoes,
      ativo: dto.ativo ?? true,
      criadoEm: dto.criadoEm,
    };
  }

  private converterModelParaDTO(form: Partial<ContaReceber>): any {
    const dto: any = {};
    if (form.descricao !== undefined) dto.descricao = form.descricao;
    if (form.valor !== undefined) dto.valor = form.valor;
    if (form.dataVencimento !== undefined) dto.dataVencimento = form.dataVencimento;
    if (form.categoria !== undefined) dto.categoria = form.categoria;
    if (form.clienteId !== undefined) dto.clienteId = form.clienteId;
    if (form.observacoes !== undefined) dto.observacoes = form.observacoes;
    return dto;
  }
}
