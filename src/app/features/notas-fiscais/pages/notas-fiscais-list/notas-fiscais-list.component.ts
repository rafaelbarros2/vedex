import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputTextarea } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NotasFiscaisService } from '../../services/notas-fiscais.service';
import { NotaFiscal, StatusNotaFiscal, TipoNotaFiscal } from '../../models/nota-fiscal.model';

@Component({
  selector: 'app-notas-fiscais-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    TagModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    InputTextarea,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './notas-fiscais-list.component.html',
  styleUrl: './notas-fiscais-list.component.css'
})
export class NotasFiscaisListComponent implements OnInit {
  notasFiscais = signal<NotaFiscal[]>([]);

  // Filtros
  dataInicio: Date | null = null;
  dataFim: Date | null = null;
  tipoFiltro: TipoNotaFiscal | null = null;
  statusFiltro: StatusNotaFiscal | null = null;
  clienteFiltro = '';
  numeroFiltro = '';

  // Dialog de cancelamento
  showCancelamentoDialog = false;
  notaParaCancelar: NotaFiscal | null = null;
  motivoCancelamento = '';

  tiposOptions = [
    { label: 'NF-e (Nota Fiscal Eletrônica)', value: 'nfe' },
    { label: 'NFC-e (Cupom Fiscal Eletrônico)', value: 'nfce' },
    { label: 'NFS-e (Nota Fiscal de Serviço)', value: 'nfse' }
  ];

  statusOptions = [
    { label: 'Autorizada', value: 'autorizada' },
    { label: 'Cancelada', value: 'cancelada' },
    { label: 'Denegada', value: 'denegada' },
    { label: 'Rejeitada', value: 'rejeitada' },
    { label: 'Processando', value: 'processando' },
    { label: 'Contingência', value: 'contingencia' }
  ];

  constructor(
    private notasFiscaisService: NotasFiscaisService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.carregarNotasFiscais();
  }

  carregarNotasFiscais() {
    this.notasFiscais.set(this.notasFiscaisService.getNotasFiscais());
  }

  aplicarFiltros() {
    const notas = this.notasFiscaisService.filtrarNotasFiscais({
      dataInicio: this.dataInicio || undefined,
      dataFim: this.dataFim || undefined,
      tipo: this.tipoFiltro || undefined,
      status: this.statusFiltro || undefined,
      clienteNome: this.clienteFiltro || undefined,
      numero: this.numeroFiltro || undefined
    });
    this.notasFiscais.set(notas);
  }

  limparFiltros() {
    this.dataInicio = null;
    this.dataFim = null;
    this.tipoFiltro = null;
    this.statusFiltro = null;
    this.clienteFiltro = '';
    this.numeroFiltro = '';
    this.carregarNotasFiscais();
  }

  novaNotaFiscal() {
    this.router.navigate(['/notas-fiscais/nova']);
  }

  visualizarNota(id: number) {
    this.router.navigate(['/notas-fiscais/visualizar', id]);
  }

  abrirDialogCancelamento(nota: NotaFiscal) {
    if (nota.status !== 'autorizada') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Apenas notas autorizadas podem ser canceladas'
      });
      return;
    }

    this.notaParaCancelar = nota;
    this.motivoCancelamento = '';
    this.showCancelamentoDialog = true;
  }

  confirmarCancelamento() {
    if (!this.notaParaCancelar || !this.motivoCancelamento.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Informe o motivo do cancelamento'
      });
      return;
    }

    try {
      this.notasFiscaisService.cancelarNotaFiscal(
        this.notaParaCancelar.id,
        this.motivoCancelamento
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Nota fiscal cancelada com sucesso'
      });

      this.showCancelamentoDialog = false;
      this.notaParaCancelar = null;
      this.motivoCancelamento = '';
      this.carregarNotasFiscais();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: error.message
      });
    }
  }

  downloadXML(nota: NotaFiscal) {
    if (!nota.xmlUrl) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'XML não disponível'
      });
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Download',
      detail: 'Download do XML iniciado'
    });
    // Aqui você implementaria o download real do arquivo
    // window.open(nota.xmlUrl, '_blank');
  }

  downloadPDF(nota: NotaFiscal) {
    if (!nota.pdfUrl) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'PDF não disponível'
      });
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Download',
      detail: 'Download do PDF iniciado'
    });
    // Aqui você implementaria o download real do arquivo
    // window.open(nota.pdfUrl, '_blank');
  }

  copiarChaveAcesso(chave: string) {
    navigator.clipboard.writeText(chave).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copiado',
        detail: 'Chave de acesso copiada'
      });
    });
  }

  getTipoLabel(tipo: TipoNotaFiscal): string {
    const labels: Record<TipoNotaFiscal, string> = {
      nfe: 'NF-e',
      nfce: 'NFC-e',
      nfse: 'NFS-e'
    };
    return labels[tipo];
  }

  getTipoSeverity(tipo: TipoNotaFiscal): string {
    const severities: Record<TipoNotaFiscal, string> = {
      nfe: 'info',
      nfce: 'success',
      nfse: 'warning'
    };
    return severities[tipo];
  }

  getStatusLabel(status: StatusNotaFiscal): string {
    const labels: Record<StatusNotaFiscal, string> = {
      autorizada: 'Autorizada',
      cancelada: 'Cancelada',
      denegada: 'Denegada',
      rejeitada: 'Rejeitada',
      processando: 'Processando',
      contingencia: 'Contingência'
    };
    return labels[status];
  }

  getStatusSeverity(status: StatusNotaFiscal): string {
    const severities: Record<StatusNotaFiscal, string> = {
      autorizada: 'success',
      cancelada: 'danger',
      denegada: 'danger',
      rejeitada: 'warning',
      processando: 'info',
      contingencia: 'warning'
    };
    return severities[status];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('pt-BR');
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  getValorTotalGeral(): number {
    return this.notasFiscais().reduce((acc, n) => acc + n.valorTotal, 0);
  }
}
