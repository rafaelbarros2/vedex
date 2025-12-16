import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';
import { CarrinhoItem } from '../../../../shared/models/carrinho.model';

export interface PaymentData {
  type: 'dinheiro' | 'cartao';
  valorRecebido?: number;
  troco?: number;
}

@Component({
  selector: 'app-pagamento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    RadioButtonModule,
    DividerModule
  ],
  templateUrl: './pagamento.component.html',
  styleUrl: './pagamento.component.css'
})
export class PagamentoComponent {
  @Input() visible = false;
  @Input() items: CarrinhoItem[] = [];
  @Input() total = 0;
  @Input() numeroVenda = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() paymentConfirmed = new EventEmitter<PaymentData>();
  @Output() paymentCancelled = new EventEmitter<void>();

  paymentType: 'dinheiro' | 'cartao' = 'dinheiro';
  valorRecebido = 0;

  get troco(): number {
    return this.valorRecebido > this.total ? this.valorRecebido - this.total : 0;
  }

  get canConfirm(): boolean {
    if (this.paymentType === 'cartao') {
      return true;
    }
    return this.valorRecebido >= this.total;
  }

  onHide() {
    this.visibleChange.emit(false);
    this.resetForm();
  }

  onCancel() {
    this.paymentCancelled.emit();
    this.onHide();
  }

  onConfirm() {
    const paymentData: PaymentData = {
      type: this.paymentType,
      valorRecebido: this.paymentType === 'dinheiro' ? this.valorRecebido : this.total,
      troco: this.troco
    };

    this.paymentConfirmed.emit(paymentData);
    this.onHide();
  }

  private resetForm() {
    this.paymentType = 'dinheiro';
    this.valorRecebido = 0;
  }

  formatPrice(price: number): string {
    return price.toFixed(2).replace('.', ',');
  }
}