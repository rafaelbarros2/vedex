import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NotasFiscaisService } from '../../services/notas-fiscais.service';
import { TipoNotaFiscal } from '../../models/nota-fiscal.model';

interface VendaParaNF {
  id: number;
  numeroVenda: string;
  data: Date;
  clienteNome?: string;
  clienteCpfCnpj?: string;
  clienteId?: number;
  valorTotal: number;
  formaPagamento: string;
  produtos: {
    nome: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }[];
  temNotaFiscal: boolean;
}

@Component({
  selector: 'app-nota-fiscal-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    InputMaskModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './nota-fiscal-form.component.html',
  styleUrl: './nota-fiscal-form.component.css'
})
export class NotaFiscalFormComponent implements OnInit {
  vendas = signal<VendaParaNF[]>([]);
  vendaSelecionada: VendaParaNF | null = null;

  // Dados do cliente
  clienteNome = '';
  clienteCpfCnpj = '';
  clienteEmail = '';
  clienteTelefone = '';
  clienteEndereco = '';
  clienteCidade = '';
  clienteUF = '';
  clienteCEP = '';

  // Dados da nota
  tipoNota: TipoNotaFiscal = 'nfce';
  observacoes = '';
  isEmitindo = false;

  tiposOptions = [
    { label: 'NFC-e (Cupom Fiscal Eletrônico)', value: 'nfce' },
    { label: 'NF-e (Nota Fiscal Eletrônica)', value: 'nfe' },
    { label: 'NFS-e (Nota Fiscal de Serviço)', value: 'nfse' }
  ];

  constructor(
    private notasFiscaisService: NotasFiscaisService,
    public router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.carregarVendas();
  }

  carregarVendas() {
    this.notasFiscaisService.buscarVendasDisponiveisAPI().subscribe(dtos => {
      const vendas: VendaParaNF[] = dtos.map(dto =>
        this.notasFiscaisService.converterVendaParaNF(dto)
      );
      this.vendas.set(vendas);
    });
  }

  selecionarVenda(venda: VendaParaNF) {
    this.vendaSelecionada = venda;

    // Preenche dados do cliente se existirem
    this.clienteNome = venda.clienteNome || '';
    this.clienteCpfCnpj = venda.clienteCpfCnpj || '';

    // Limpa outros campos
    this.clienteEmail = '';
    this.clienteTelefone = '';
    this.clienteEndereco = '';
    this.clienteCidade = '';
    this.clienteUF = '';
    this.clienteCEP = '';
    this.observacoes = '';

    // Define tipo padrão baseado no documento do cliente
    if (venda.clienteCpfCnpj && venda.clienteCpfCnpj.replace(/\D/g, '').length > 11) {
      this.tipoNota = 'nfe'; // CNPJ (14 dígitos) = NF-e
    } else {
      this.tipoNota = 'nfce'; // CPF ou anônimo = NFC-e
    }
  }

  voltarParaLista() {
    this.vendaSelecionada = null;
  }

  emitirNota() {
    if (!this.vendaSelecionada || this.isEmitindo) return;

    // Validação básica para NF-e
    if (this.tipoNota === 'nfe' && !this.clienteNome) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Para NF-e é obrigatório informar os dados do cliente'
      });
      return;
    }

    if (this.tipoNota === 'nfe' && !this.clienteCpfCnpj) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Para NF-e é obrigatório informar CPF/CNPJ do cliente'
      });
      return;
    }

    this.isEmitindo = true;

    this.messageService.add({
      severity: 'info',
      summary: 'Processando',
      detail: 'Enviando nota fiscal para autorização...'
    });

    this.notasFiscaisService.emitirAPI({
      vendaId: this.vendaSelecionada.id,
      tipo: this.tipoNota,
      clienteId: this.vendaSelecionada.clienteId,
      observacoes: this.observacoes || undefined
    }).subscribe({
      next: () => {
        this.isEmitindo = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Nota fiscal emitida e autorizada com sucesso!'
        });
        setTimeout(() => this.router.navigate(['/notas-fiscais']), 1500);
      },
      error: (err) => {
        this.isEmitindo = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.error?.message || err.message || 'Erro ao emitir nota fiscal'
        });
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
