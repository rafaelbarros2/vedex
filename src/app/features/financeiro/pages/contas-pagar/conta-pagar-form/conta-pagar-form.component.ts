import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextarea } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ContaPagarService } from '../../../services/conta-pagar.service';

@Component({
  selector: 'app-conta-pagar-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    InputTextarea,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './conta-pagar-form.component.html',
})
export class ContaPagarFormComponent implements OnInit {
  private contaPagarService = inject(ContaPagarService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  contaId: number | null = null;
  salvando = false;
  carregando = false;

  // Campos do formulário
  descricao = '';
  valor: number | null = null;
  dataVencimento: Date | null = null;
  categoria = '';
  observacoes = '';

  categoriaOptions = [
    { label: 'Fornecedor', value: 'FORNECEDOR' },
    { label: 'Aluguel', value: 'ALUGUEL' },
    { label: 'Salário', value: 'SALARIO' },
    { label: 'Serviço', value: 'SERVICO' },
    { label: 'Impostos', value: 'IMPOSTOS' },
    { label: 'Utilities', value: 'UTILITIES' },
    { label: 'Outro', value: 'OUTRO' },
  ];

  // Campos readonly (modo edição)
  criadoEm = signal<string | undefined>(undefined);
  statusAtual = signal<string | undefined>(undefined);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nova') {
      this.contaId = parseInt(id, 10);
      this.isEditMode = true;
      this.carregarConta(this.contaId);
    }
  }

  carregarConta(id: number) {
    this.carregando = true;
    this.contaPagarService.buscarPorIdAPI(id).subscribe({
      next: conta => {
        this.descricao = conta.descricao;
        this.valor = conta.valor;
        this.dataVencimento = conta.dataVencimento ? new Date(conta.dataVencimento + 'T12:00:00') : null;
        this.categoria = conta.categoria ?? '';
        this.observacoes = conta.observacoes ?? '';
        this.criadoEm.set(conta.criadoEm);
        this.statusAtual.set(conta.statusLabel ?? conta.status);
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar a conta' });
      },
    });
  }

  formularioValido(): boolean {
    return this.descricao.trim().length > 0 &&
      this.valor !== null && this.valor > 0 &&
      this.dataVencimento !== null;
  }

  salvar() {
    if (!this.formularioValido() || this.salvando) return;
    this.salvando = true;

    const dataStr = this.dataVencimento
      ? this.formatarDataParaApi(this.dataVencimento)
      : '';

    const payload: any = {
      descricao: this.descricao.trim(),
      valor: this.valor,
      dataVencimento: dataStr,
      categoria: this.categoria || undefined,
      observacoes: this.observacoes.trim() || undefined,
    };

    const obs = this.isEditMode && this.contaId
      ? this.contaPagarService.atualizarAPI(this.contaId, payload)
      : this.contaPagarService.criarAPI(payload);

    obs.subscribe({
      next: () => {
        this.salvando = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.isEditMode ? 'Conta atualizada com sucesso' : 'Conta criada com sucesso',
        });
        setTimeout(() => this.router.navigate(['/financeiro/pagar']), 1200);
      },
      error: err => {
        this.salvando = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.mensagem || 'Erro ao salvar conta' });
      },
    });
  }

  cancelar() {
    this.router.navigate(['/financeiro/pagar']);
  }

  private formatarDataParaApi(data: Date): string {
    const y = data.getFullYear();
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const d = String(data.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
