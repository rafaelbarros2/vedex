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
    // Mock de vendas - em produção viria do backend
    const vendasMock: VendaParaNF[] = [
      {
        id: 1,
        numeroVenda: 'VND-001',
        data: new Date('2024-01-15'),
        clienteNome: 'João Silva',
        clienteCpfCnpj: '123.456.789-00',
        valorTotal: 150.50,
        formaPagamento: 'Dinheiro',
        produtos: [
          { nome: 'Produto A', quantidade: 2, valorUnitario: 50.00, valorTotal: 100.00 },
          { nome: 'Produto B', quantidade: 1, valorUnitario: 50.50, valorTotal: 50.50 }
        ],
        temNotaFiscal: false
      },
      {
        id: 2,
        numeroVenda: 'VND-002',
        data: new Date('2024-01-15'),
        clienteNome: 'Maria Santos',
        clienteCpfCnpj: '987.654.321-00',
        valorTotal: 320.00,
        formaPagamento: 'Cartão',
        produtos: [
          { nome: 'Produto C', quantidade: 4, valorUnitario: 80.00, valorTotal: 320.00 }
        ],
        temNotaFiscal: false
      },
      {
        id: 3,
        numeroVenda: 'VND-003',
        data: new Date('2024-01-14'),
        valorTotal: 89.90,
        formaPagamento: 'PIX',
        produtos: [
          { nome: 'Produto D', quantidade: 1, valorUnitario: 89.90, valorTotal: 89.90 }
        ],
        temNotaFiscal: false
      }
    ];

    this.vendas.set(vendasMock);
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

    // Define tipo padrão baseado na venda
    if (venda.clienteCpfCnpj && venda.clienteCpfCnpj.length > 14) {
      this.tipoNota = 'nfe'; // CNPJ = NF-e
    } else {
      this.tipoNota = 'nfce'; // CPF ou sem doc = NFC-e
    }
  }

  voltarParaLista() {
    this.vendaSelecionada = null;
  }

  emitirNota() {
    if (!this.vendaSelecionada) return;

    // Validação básica
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

    try {
      // Prepara dados para emissão
      const dadosEmissao = {
        vendaId: this.vendaSelecionada.id,
        tipo: this.tipoNota,
        clienteNome: this.clienteNome,
        clienteCpfCnpj: this.clienteCpfCnpj,
        clienteEmail: this.clienteEmail,
        clienteTelefone: this.clienteTelefone,
        clienteEndereco: this.clienteEndereco,
        clienteCidade: this.clienteCidade,
        clienteUF: this.clienteUF,
        clienteCEP: this.clienteCEP,
        produtos: this.vendaSelecionada.produtos.map(p => ({
          codigo: '001', // Viria do produto real
          descricao: p.nome,
          ncm: '12345678', // Viria do produto real
          cfop: '5102', // Viria da configuração
          unidade: 'UN',
          quantidade: p.quantidade,
          valorUnitario: p.valorUnitario,
          valorTotal: p.valorTotal
        })),
        valorTotal: this.vendaSelecionada.valorTotal,
        observacoes: this.observacoes
      };

      // Simula emissão (em produção seria chamada ao backend)
      this.messageService.add({
        severity: 'info',
        summary: 'Processando',
        detail: 'Enviando nota fiscal para autorização...'
      });

      // Simula delay de processamento
      setTimeout(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Nota fiscal emitida e autorizada com sucesso!'
        });

        setTimeout(() => {
          this.router.navigate(['/notas-fiscais']);
        }, 1500);
      }, 2000);

    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: error.message || 'Erro ao emitir nota fiscal'
      });
    }
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
