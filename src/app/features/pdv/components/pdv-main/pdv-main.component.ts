import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { CarrinhoItem } from '../../../../shared/models/carrinho.model';
import { Produto } from '../../../../shared/models/produto.model';
import { PdvService } from '../../services/pdv.service';
import { CarrinhoComponent } from '../carrinho/carrinho.component';
import { ConfigPdvComponent } from '../config-pdv/config-pdv.component';
import { HistoricoComponent } from '../historico/historico.component';
import { PagamentoComponent, PaymentData, PaymentType } from '../pagamento/pagamento.component';
import { PdvHeaderComponent } from '../pdv-header/pdv-header.component';
import { ProductGridComponent } from '../product-grid/product-grid.component';

@Component({
  selector: 'app-pdv-main',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    PdvHeaderComponent,
    ProductGridComponent,
    CarrinhoComponent,
    PagamentoComponent,
    HistoricoComponent,
    ConfigPdvComponent
  ],
  providers: [MessageService],
  templateUrl: './pdv-main.component.html',
  styleUrl: './pdv-main.component.css'
})
export class PdvMainComponent {
  activeView = signal<'pdv' | 'history' | 'config'>('pdv');
  showPaymentDialog = signal(false);

  constructor(
    public pdvService: PdvService,
    private messageService: MessageService
  ) {}

  // Eventos do cabeçalho
  onViewChange(view: 'pdv' | 'history' | 'config') {
    this.activeView.set(view);
  }

  onCloseCashier() {
    this.messageService.add({
      severity: 'info',
      summary: 'Fechar Caixa',
      detail: 'Funcionalidade de fechamento de caixa em desenvolvimento'
    });
  }

  // Eventos da grade de produtos
  onProductSelected(produto: Produto) {
    this.pdvService.adicionarAoCarrinho(produto);
    this.messageService.add({
      severity: 'success',
      summary: 'Produto Adicionado',
      detail: `${produto.nome} foi adicionado ao carrinho`,
      life: 2000
    });
  }

  // Eventos do carrinho
  onQuantityChanged(event: { item: CarrinhoItem; change: number }) {
    this.pdvService.atualizarQuantidade(event.item, event.change);
  }

  onItemRemoved(produtoId: number) {
    this.pdvService.removerDoCarrinho(produtoId);
    this.messageService.add({
      severity: 'info',
      summary: 'Produto Removido',
      detail: 'Produto foi removido do carrinho',
      life: 2000
    });
  }

  onCartCleared() {
    this.pdvService.limparCarrinho();
    this.messageService.add({
      severity: 'warn',
      summary: 'Carrinho Limpo',
      detail: 'Todos os produtos foram removidos do carrinho',
      life: 3000
    });
  }

  onFinalizeSale() {
    if (this.pdvService.carrinho().length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Carrinho Vazio',
        detail: 'Adicione produtos ao carrinho para finalizar a venda'
      });
      return;
    }
    this.showPaymentDialog.set(true);
  }

  onPaymentSelected(type: PaymentType) {
    this.showPaymentDialog.set(true);
  }

  onDiscountRequested() {
    this.messageService.add({
      severity: 'info',
      summary: 'Desconto',
      detail: 'Funcionalidade de desconto em desenvolvimento'
    });
  }

  onCustomerRequested() {
    this.messageService.add({
      severity: 'info',
      summary: 'Cliente',
      detail: 'Funcionalidade de cadastro de cliente em desenvolvimento'
    });
  }

  // Eventos do pagamento
  onPaymentConfirmed(paymentData: PaymentData) {
    const valorPago = paymentData.valorRecebido ?? this.pdvService.total();

    this.pdvService.finalizarVendaAPI(paymentData.type, valorPago).subscribe({
      next: (vendaId) => {
        this.showPaymentDialog.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Venda Finalizada',
          detail: `Venda ${vendaId} foi concluída com sucesso!`,
          life: 5000
        });

        if (paymentData.type === 'dinheiro' && paymentData.troco && paymentData.troco > 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Troco',
            detail: `Troco a devolver: R$ ${paymentData.troco.toFixed(2).replace('.', ',')}`,
            life: 8000
          });
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro na Venda',
          detail: err.error?.message || err.message || 'Ocorreu um erro ao finalizar a venda'
        });
      }
    });
  }

  onPaymentCancelled() {
    this.messageService.add({
      severity: 'info',
      summary: 'Pagamento Cancelado',
      detail: 'O processo de pagamento foi cancelado',
      life: 3000
    });
  }

  // Utilitários
  get numeroVenda(): string {
    return this.pdvService.obterProximoNumeroVenda();
  }
}