import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PdvThemeService } from '../../services/pdv-theme.service';

// --- Interfaces, Tipos e Dados Iniciais ---

interface ConfiguracoesPDV {
  loja: {
    nome: string;
    cnpj: string;
    endereco: string;
  };
  caixa: {
    valorAbertura: number;
    limiteSangria: number;
    permitirVendaCaixaFechado: boolean;
    numeroCaixa: number;
    operadorPadrao: string;
    permitirTrocaOperador: boolean;
    exigirSenhaCancelamento: boolean;
    exigirSupervisorDesconto: boolean;
    percentualDescontoSupervisor: number;
    permitirVendaEstoqueNegativo: boolean;
    bloquearVendaSemPreco: boolean;
  };
  impressao: {
    autoPrint: boolean;
    mensagemRodape: string;
    tipoImpressora: 'termica' | 'matricial' | 'usb' | 'rede';
    portaComunicacao: string;
    modeloImpressora: string;
    tamanhoPapel: '58mm' | '80mm';
    numeroVias: number;
    logoEmpresaUrl: string;
    mostrarVendedorCupom: boolean;
    mostrarFormaPagamento: boolean;
  };
  pagamento: {
    aceitaDinheiro: boolean;
    aceitaCartaoDebito: boolean;
    aceitaCartaoCredito: boolean;
    aceitaPix: boolean;
    aceitaValeTicket: boolean;
    aceitaCrediario: boolean;
    aceitaBoleto: boolean;
  };
  aparencia: {
    tema: 'claro' | 'escuro';
  };
}

const CONFIGURACOES_INICIAIS: ConfiguracoesPDV = {
  loja: { nome: 'Minha Loja Exemplo', cnpj: '12.345.678/0001-99', endereco: 'Rua das Flores, 123, Centro' },
  caixa: { valorAbertura: 100.00, limiteSangria: 1000.00, permitirVendaCaixaFechado: false, numeroCaixa: 1, operadorPadrao: 'Admin', permitirTrocaOperador: true, exigirSenhaCancelamento: true, exigirSupervisorDesconto: true, percentualDescontoSupervisor: 10, permitirVendaEstoqueNegativo: false, bloquearVendaSemPreco: true },
  impressao: { autoPrint: true, mensagemRodape: 'Obrigado pela preferência!', tipoImpressora: 'termica', portaComunicacao: 'USB001', modeloImpressora: 'Bematech MP-4200 TH', tamanhoPapel: '80mm', numeroVias: 1, logoEmpresaUrl: '', mostrarVendedorCupom: true, mostrarFormaPagamento: true },
  pagamento: { aceitaDinheiro: true, aceitaCartaoDebito: true, aceitaCartaoCredito: true, aceitaPix: true, aceitaValeTicket: false, aceitaCrediario: false, aceitaBoleto: false },
  aparencia: { tema: 'claro' },
};

type ActiveTab = 'geral' | 'caixa' | 'impressao' | 'pagamento';

interface Operador { id: number; nome: string; }

@Component({
  selector: 'app-config-pdv',
    imports: [ CommonModule, FormsModule, ButtonModule ],
  standalone: true,
   changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './config-pdv.component.html',
  styleUrl: './config-pdv.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ConfigPdvComponent {

 configuracoes = signal<ConfiguracoesPDV>(JSON.parse(JSON.stringify(CONFIGURACOES_INICIAIS)));
  saveMessageVisible = signal(false);
  activeTab = signal<ActiveTab>('geral');
  operadores = signal<Operador[]>([
    { id: 1, nome: 'Admin' },
    { id: 2, nome: 'Caixa Padrão' },
    { id: 3, nome: 'Gerente Loja' },
    { id: 4, nome: 'Operador 1' },
  ]);

  constructor(private themeService: PdvThemeService) {
    // Carrega o tema do serviço ao inicializar
    const temaSalvo = this.themeService.getTema();
    this.configuracoes.update(config => ({
      ...config,
      aparencia: { tema: temaSalvo }
    }));
  }

  setActiveTab(tab: ActiveTab) { this.activeTab.set(tab); }

  salvarConfiguracoes() {
    console.log('Configurações salvas:', this.configuracoes());
    this.saveMessageVisible.set(true);
    setTimeout(() => this.saveMessageVisible.set(false), 3000);
  }

  restaurarPadroes() {
    this.configuracoes.set(JSON.parse(JSON.stringify(CONFIGURACOES_INICIAIS)));
    console.log('Configurações restauradas para o padrão.');
  }
  
  setTema(tema: 'claro' | 'escuro') {
    this.configuracoes.update((configs: ConfiguracoesPDV) => ({ ...configs, aparencia: { ...configs.aparencia, tema: tema }}));
    this.themeService.setTema(tema);
    console.log('Tema alterado para:', tema);
  }
}

