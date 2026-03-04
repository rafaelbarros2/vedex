import { Component, EventEmitter, Output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CaixaService } from '../../../caixa/services/caixa.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-pdv-header',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './pdv-header.component.html',
  styleUrl: './pdv-header.component.css'
})
export class PdvHeaderComponent {
  @Output() viewChanged = new EventEmitter<'pdv' | 'history' | 'config'>();
  @Output() closeCashier = new EventEmitter<void>();

  private caixaService = inject(CaixaService);
  private authService = inject(AuthService);

  identificadorPdv = computed(() =>
    this.caixaService.caixaAtual()?.identificadorPdv || 'PDV'
  );

  nomeOperador = computed(() =>
    this.authService.userInfo()?.fullName || 'Operador'
  );

  onViewChange(view: 'pdv' | 'history' | 'config') {
    this.viewChanged.emit(view);
  }

  onCloseCashier() {
    this.closeCashier.emit();
  }
}
