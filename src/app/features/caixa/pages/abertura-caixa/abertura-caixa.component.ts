import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CaixaService } from '../../services/caixa.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-abertura-caixa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './abertura-caixa.component.html',
  styleUrl: './abertura-caixa.component.css'
})
export class AberturaCaixaComponent {
  private caixaService = inject(CaixaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  valorAbertura: number = 0;
  identificadorPdv: string = '';
  observacoes: string = '';

  /** true para GERENTE, ADMIN e SUPER_ADMIN */
  podeAbrirCaixa = computed(() =>
    this.authService.hasAnyRole(['GERENTE', 'ADMIN', 'SUPER_ADMIN'])
  );

  abrirCaixa() {
    if (!this.podeAbrirCaixa()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acesso Negado',
        detail: 'Apenas Gerentes e Administradores podem abrir o caixa'
      });
      return;
    }

    if (this.valorAbertura < 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'O valor de abertura deve ser maior ou igual a zero'
      });
      return;
    }

    this.caixaService.abrirCaixa(
      this.valorAbertura,
      this.identificadorPdv.trim() || undefined,
      this.observacoes || undefined
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Caixa aberto com sucesso!'
        });

        setTimeout(() => {
          this.router.navigate(['/caixa']);
        }, 1000);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || error.error?.mensagem || 'Erro ao abrir caixa'
        });
      }
    });
  }

  cancelar() {
    this.router.navigate(['/dashboard']);
  }
}
