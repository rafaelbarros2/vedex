import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FluxoCaixaService } from '../../services/fluxo-caixa.service';
import { FluxoCaixa, FluxoDiario } from '../../models/fluxo-caixa.model';

@Component({
  selector: 'app-fluxo-caixa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    CalendarModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './fluxo-caixa.component.html',
})
export class FluxoCaixaComponent implements OnInit {
  private fluxoCaixaService = inject(FluxoCaixaService);
  private messageService = inject(MessageService);

  carregando = false;
  fluxo = signal<FluxoCaixa | null>(null);

  dataInicio: Date = this.subtrairDias(new Date(), 29);
  dataFim: Date = new Date();

  periodoSelecionado = signal<string>('30d');

  totalEntradas = computed(() => this.fluxo()?.totalEntradas ?? 0);
  totalSaidas = computed(() => this.fluxo()?.totalSaidas ?? 0);
  saldo = computed(() => this.fluxo()?.saldo ?? 0);
  fluxoPorDia = computed(() => this.fluxo()?.fluxoPorDia ?? []);

  ngOnInit() {
    this.carregar();
  }

  selecionarPeriodo(periodo: string) {
    this.periodoSelecionado.set(periodo);
    const hoje = new Date();
    this.dataFim = hoje;
    if (periodo === 'hoje') {
      this.dataInicio = new Date(hoje);
    } else if (periodo === '7d') {
      this.dataInicio = this.subtrairDias(hoje, 6);
    } else if (periodo === '30d') {
      this.dataInicio = this.subtrairDias(hoje, 29);
    } else if (periodo === '90d') {
      this.dataInicio = this.subtrairDias(hoje, 89);
    }
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    const inicio = this.formatarData(this.dataInicio);
    const fim = this.formatarData(this.dataFim);
    this.fluxoCaixaService.getFluxoCaixa(inicio, fim).subscribe({
      next: (data) => {
        this.fluxo.set(data);
        this.carregando = false;
      },
      error: (err) => {
        this.carregando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar o fluxo de caixa',
        });
      },
    });
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor ?? 0);
  }

  formatarData(data: Date): string {
    const y = data.getFullYear();
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const d = String(data.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatarDataExibicao(dataStr: string): string {
    if (!dataStr) return '';
    const parts = dataStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  private subtrairDias(data: Date, dias: number): Date {
    const d = new Date(data);
    d.setDate(d.getDate() - dias);
    return d;
  }
}
