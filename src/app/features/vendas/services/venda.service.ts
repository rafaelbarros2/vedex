import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  VendaDetalhe,
  FormaPagamentoVenda,
  StatusVenda
} from '../models/venda.model';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vendas`;

  private _vendas = signal<VendaDetalhe[]>([]);
  readonly vendas = this._vendas.asReadonly();

  listarTodasAPI(): Observable<VendaDetalhe[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(dtos => dtos.map(dto => this.converterDTOParaModel(dto))),
      tap(vendas => this._vendas.set(vendas)),
      catchError(err => {
        console.error('Erro ao listar vendas:', err);
        throw err;
      })
    );
  }

  buscarPorIdAPI(id: number): Observable<VendaDetalhe> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.converterDTOParaModel(dto)),
      catchError(err => {
        console.error('Erro ao buscar venda:', err);
        throw err;
      })
    );
  }

  cancelarAPI(id: number, usuarioId: number, motivo: string): Observable<void> {
    const params = `usuarioId=${usuarioId}&motivo=${encodeURIComponent(motivo)}`;
    return this.http.post<void>(`${this.apiUrl}/${id}/cancelar?${params}`, {}).pipe(
      catchError(err => {
        console.error('Erro ao cancelar venda:', err);
        throw err;
      })
    );
  }

  private converterDTOParaModel(dto: any): VendaDetalhe {
    return {
      id: dto.id,
      numeroVenda: dto.numeroVenda || `#${dto.id}`,
      cliente: dto.cliente ? {
        id: dto.cliente.id,
        nome: dto.cliente.nome,
        cpfCnpj: dto.cliente.cpfCnpj
      } : undefined,
      usuario: dto.usuario ? {
        id: dto.usuario.id,
        nome: dto.usuario.nome
      } : undefined,
      dataVenda: new Date(dto.dataVenda),
      subtotal: parseFloat(dto.subtotal) || 0,
      desconto: parseFloat(dto.desconto) || 0,
      total: parseFloat(dto.total) || 0,
      formaPagamento: this.mapFormaPagamento(dto.formaPagamento),
      valorPago: parseFloat(dto.valorPago) || 0,
      troco: parseFloat(dto.troco) || 0,
      status: this.mapStatus(dto.status),
      itens: (dto.itens || []).map((item: any) => ({
        id: item.id,
        produto: {
          id: item.produto?.id || 0,
          nome: item.produto?.nome || item.nomeProduto || '',
          codigo: item.produto?.codigo || ''
        },
        quantidade: item.quantidade || 0,
        precoUnitario: parseFloat(item.precoUnitario) || 0,
        desconto: parseFloat(item.desconto) || 0,
        subtotal: parseFloat(item.subtotal) || 0
      })),
      notaFiscalId: dto.notaFiscal?.id,
      observacoes: dto.observacoes
    };
  }

  private mapFormaPagamento(fp: string): FormaPagamentoVenda {
    const map: Record<string, FormaPagamentoVenda> = {
      'DINHEIRO': 'dinheiro',
      'CARTAO_DEBITO': 'cartao_debito',
      'CARTAO_CREDITO': 'cartao_credito',
      'PIX': 'pix'
    };
    return map[fp] || 'dinheiro';
  }

  private mapStatus(status: string): StatusVenda {
    const map: Record<string, StatusVenda> = {
      'CONCLUIDA': 'concluida',
      'CANCELADA': 'cancelada',
      'DEVOLUCAO': 'devolucao',
      'DEVOLVIDA': 'devolvida'
    };
    return map[status] || 'concluida';
  }

  getFormaPagamentoLabel(fp: FormaPagamentoVenda): string {
    const labels: Record<FormaPagamentoVenda, string> = {
      dinheiro: 'Dinheiro',
      cartao_debito: 'Cartão Débito',
      cartao_credito: 'Cartão Crédito',
      pix: 'PIX'
    };
    return labels[fp];
  }

  getStatusLabel(status: StatusVenda): string {
    const labels: Record<StatusVenda, string> = {
      concluida: 'Concluída',
      cancelada: 'Cancelada',
      devolucao: 'Em Devolução',
      devolvida: 'Devolvida'
    };
    return labels[status];
  }

  getStatusSeverity(status: StatusVenda): string {
    const severities: Record<StatusVenda, string> = {
      concluida: 'success',
      cancelada: 'danger',
      devolucao: 'warn',
      devolvida: 'secondary'
    };
    return severities[status];
  }
}
