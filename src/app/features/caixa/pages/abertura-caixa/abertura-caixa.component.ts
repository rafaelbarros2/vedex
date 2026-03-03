import { Component } from '@angular/core';
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
  valorAbertura: number = 0;
  observacoes: string = '';

  constructor(
    private caixaService: CaixaService,
    private router: Router,
    private messageService: MessageService
  ) { }

  abrirCaixa() {
    if (this.valorAbertura < 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'O valor de abertura deve ser maior ou igual a zero'
      });
      return;
    }

    this.caixaService.abrirCaixa(this.valorAbertura, this.observacoes || undefined)
      .subscribe({
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
            detail: error.error?.message || 'Erro ao abrir caixa'
          });
        }
      });
  }

  cancelar() {
    this.router.navigate(['/caixa']);
  }
}
