import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { Produto } from '../../../../shared/models/produto.model';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, CardModule],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.css'
})
export class ProductGridComponent {
  @Input() produtos: Produto[] = [];
  @Output() productSelected = new EventEmitter<Produto>();

  searchTerm = '';

  filteredProducts() {
    if (!this.searchTerm.trim()) {
      return this.produtos;
    }

    const term = this.searchTerm.toLowerCase();
    return this.produtos.filter(produto =>
      produto.nome.toLowerCase().includes(term) ||
      produto.codigo?.toLowerCase().includes(term) ||
      produto.categoria?.toLowerCase().includes(term)
    );
  }

  onProductSelect(produto: Produto) {
    if (produto.estoque > 0) {
      this.productSelected.emit(produto);
    }
  }

  formatPrice(price: number): string {
    return price.toFixed(2).replace('.', ',');
  }
}