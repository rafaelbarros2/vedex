import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VendaHistorico, VendaHistoricoItem } from '../../../shared/models/venda-historico.model';

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {
  private vendas = signal<VendaHistorico[]>([]);

  obterVendas(): Observable<VendaHistorico[]> {
    return of(this.vendas());
  }

  adicionarVenda(venda: VendaHistorico): void {
    const vendasAtuais = this.vendas();
    this.vendas.set([venda, ...vendasAtuais]);
  }

  buscarVendaPorNumero(numeroVenda: string): VendaHistorico | null {
    return this.vendas().find(v => v.numeroVenda === numeroVenda) || null;
  }

  cancelarVenda(vendaId: string): boolean {
    const vendas = this.vendas();
    const index = vendas.findIndex(v => v.id === vendaId);

    if (index !== -1 && vendas[index].status === 'concluida') {
      const vendasAtualizadas = [...vendas];
      vendasAtualizadas[index] = {
        ...vendasAtualizadas[index],
        status: 'cancelada'
      };
      this.vendas.set(vendasAtualizadas);
      return true;
    }

    return false;
  }

  obterResumoVendas(): {
    totalVendas: number;
    totalFaturamento: number;
    vendasDinheiro: number;
    vendasCartao: number;
    vendasCanceladas: number;
  } {
    const vendas = this.vendas();

    return {
      totalVendas: vendas.filter(v => v.status === 'concluida').length,
      totalFaturamento: vendas
        .filter(v => v.status === 'concluida')
        .reduce((acc, v) => acc + v.total, 0),
      vendasDinheiro: vendas
        .filter(v => v.status === 'concluida' && v.formaPagamento === 'dinheiro')
        .length,
      vendasCartao: vendas
        .filter(v => v.status === 'concluida' && v.formaPagamento === 'cartao')
        .length,
      vendasCanceladas: vendas.filter(v => v.status === 'cancelada').length
    };
  }

  
}