import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { CarrinhoItem } from '../../../../shared/models/carrinho.model';
import { PaymentType } from '../pagamento/pagamento.component';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, ButtonModule, DividerModule, TagModule],
  templateUrl: './carrinho.component.html',
  styleUrl: './carrinho.component.css'
})
export class CarrinhoComponent {
  @Input() items: CarrinhoItem[] = [];
  @Input() numeroVenda: string = '#0001234';

  @Output() quantityChanged = new EventEmitter<{item: CarrinhoItem, change: number}>();
  @Output() itemRemoved = new EventEmitter<number>();
  @Output() cartCleared = new EventEmitter<void>();
  @Output() finalizeSale = new EventEmitter<void>();
  @Output() paymentSelected = new EventEmitter<PaymentType>();
  @Output() discountRequested = new EventEmitter<void>();
  @Output() customerRequested = new EventEmitter<void>();

  // Computed properties
  subtotal = computed(() =>
    this.items.reduce((acc, item) => acc + item.preco * item.quantidade, 0)
  );

  totalItems = computed(() =>
    this.items.reduce((acc, item) => acc + item.quantidade, 0)
  );

  total = computed(() => this.subtotal());

  onUpdateQuantity(item: CarrinhoItem, change: number) {
    this.quantityChanged.emit({ item, change });
  }

  onRemoveItem(productId: number) {
    this.itemRemoved.emit(productId);
  }

  onClearCart() {
    this.cartCleared.emit();
  }

  onFinalizeSale() {
    this.finalizeSale.emit();
  }

  onPaymentSelect(type: PaymentType) {
    this.paymentSelected.emit(type);
  }

  onRequestDiscount() {
    this.discountRequested.emit();
  }

  onRequestCustomer() {
    this.customerRequested.emit();
  }

  formatPrice(price: number): string {
    return price.toFixed(2).replace('.', ',');
  }
}