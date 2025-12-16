import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-pdv-header',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './pdv-header.component.html',
  styleUrl: './pdv-header.component.css'
})
export class PdvHeaderComponent {
  @Output() viewChanged = new EventEmitter<'pdv' | 'history' | 'config'>();
  @Output() closeCashier = new EventEmitter<void>();

  onViewChange(view: 'pdv' | 'history' | 'config') {
    this.viewChanged.emit(view);
  }

  onCloseCashier() {
    this.closeCashier.emit();
  }
}