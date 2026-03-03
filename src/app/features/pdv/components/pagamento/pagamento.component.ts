import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';
import { CarrinhoItem } from '../../../../shared/models/carrinho.model';

export type PaymentType = 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito';

export interface PaymentData {
  type: PaymentType;
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

  paymentType: PaymentType = 'dinheiro';
  valorRecebido = 0;

  get troco(): number {
    return this.valorRecebido > this.total ? this.valorRecebido - this.total : 0;
  }

  get isDinheiro(): boolean {
    return this.paymentType === 'dinheiro';
  }

  get canConfirm(): boolean {
    if (this.isDinheiro) {
      return this.valorRecebido >= this.total;
    }
    return true; // PIX, débito e crédito: sempre permite confirmar
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
      valorRecebido: this.isDinheiro ? this.valorRecebido : this.total,
      troco: this.isDinheiro ? this.troco : 0
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
