import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clientes`;

  private _clientes = signal<Cliente[]>([]);
  readonly clientes = this._clientes.asReadonly();

  // ===== API Methods =====

  listarTodosAPI(): Observable<Cliente[]> {
    return this.http.get<any[]>(`${this.apiUrl}`).pipe(
      map(dtos => dtos.map(dto => this.converterDTOParaModel(dto))),
      tap(clientes => this._clientes.set(clientes)),
      catchError(err => {
        console.error('[Clientes] Erro ao listar:', err);
        return of([]);
      })
    );
  }

  buscarPorIdAPI(id: number): Observable<Cliente> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.converterDTOParaModel(dto))
    );
  }

  criarAPI(form: Partial<Cliente>): Observable<Cliente> {
    const body = this.converterModelParaDTO(form);
    return this.http.post<any>(`${this.apiUrl}`, body).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      tap(novo => this._clientes.update(lista => [novo, ...lista]))
    );
  }

  atualizarAPI(id: number, form: Partial<Cliente>): Observable<Cliente> {
    const body = this.converterModelParaDTO(form);
    return this.http.put<any>(`${this.apiUrl}/${id}`, body).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      tap(atualizado => {
        this._clientes.update(lista =>
          lista.map(c => c.id === id ? atualizado : c)
        );
      })
    );
  }

  excluirAPI(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._clientes.update(lista => lista.filter(c => c.id !== id));
      })
    );
  }

  ativarAPI(id: number): Observable<Cliente> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/ativar`, {}).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      tap(atualizado => {
        this._clientes.update(lista =>
          lista.map(c => c.id === id ? atualizado : c)
        );
      })
    );
  }

  inativarAPI(id: number): Observable<Cliente> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/inativar`, {}).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      tap(atualizado => {
        this._clientes.update(lista =>
          lista.map(c => c.id === id ? atualizado : c)
        );
      })
    );
  }

  // ===== Helpers =====

  getClientes(): Cliente[] {
    return this._clientes();
  }

  getClienteById(id: number): Cliente | undefined {
    return this._clientes().find(c => c.id === id);
  }

  // ===== Converters =====

  converterDTOParaModel(dto: any): Cliente {
    return {
      id: dto.id,
      nome: dto.nome ?? '',
      cpfCnpj: dto.cpfCnpj ?? '',
      email: dto.email,
      telefone: dto.telefone,
      celular: dto.celular,
      endereco: dto.endereco,
      numero: dto.numero,
      complemento: dto.complemento,
      bairro: dto.bairro,
      cidade: dto.cidade,
      uf: dto.uf,
      cep: dto.cep,
      dataCadastro: dto.dataCadastro ? new Date(dto.dataCadastro) : undefined,
      ativo: dto.ativo ?? true,
      totalCompras: dto.totalCompras ?? 0
    };
  }

  private converterModelParaDTO(form: Partial<Cliente>): any {
    const dto: any = {};
    if (form.nome !== undefined)        dto.nome = form.nome;
    if (form.cpfCnpj !== undefined)     dto.cpfCnpj = form.cpfCnpj?.replace(/\D/g, '');
    if (form.email !== undefined)       dto.email = form.email || null;
    if (form.telefone !== undefined)    dto.telefone = form.telefone || null;
    if (form.celular !== undefined)     dto.celular = form.celular || null;
    if (form.endereco !== undefined)    dto.endereco = form.endereco || null;
    if (form.numero !== undefined)      dto.numero = form.numero || null;
    if (form.complemento !== undefined) dto.complemento = form.complemento || null;
    if (form.bairro !== undefined)      dto.bairro = form.bairro || null;
    if (form.cidade !== undefined)      dto.cidade = form.cidade || null;
    if (form.uf !== undefined)          dto.uf = form.uf || null;
    if (form.cep !== undefined)         dto.cep = form.cep?.replace(/\D/g, '') || null;
    if (form.ativo !== undefined)       dto.ativo = form.ativo;
    return dto;
  }
}
