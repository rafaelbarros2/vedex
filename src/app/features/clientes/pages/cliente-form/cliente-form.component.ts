import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent implements OnInit {
  isEditMode = false;
  clienteId: number | null = null;
  salvando = false;
  carregando = false;

  // Dados básicos
  nome = '';
  cpfCnpj = '';
  email = '';
  telefone = '';
  celular = '';

  // Endereço
  cep = '';
  endereco = '';
  numero = '';
  complemento = '';
  bairro = '';
  cidade = '';
  uf = '';

  // Informações extras (somente leitura)
  totalCompras = signal<number>(0);
  dataCadastro = signal<Date | undefined>(undefined);

  constructor(
    private clienteService: ClienteService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clienteId = parseInt(id, 10);
      this.isEditMode = true;
      this.carregarCliente(this.clienteId);
    }
  }

  carregarCliente(id: number) {
    this.carregando = true;
    this.clienteService.buscarPorIdAPI(id).subscribe({
      next: (cliente) => {
        this.preencherFormulario(cliente);
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os dados do cliente'
        });
      }
    });
  }

  private preencherFormulario(cliente: Cliente) {
    this.nome = cliente.nome;
    // Formata CPF/CNPJ para exibição
    const digits = cliente.cpfCnpj.replace(/\D/g, '');
    if (digits.length === 11) {
      this.cpfCnpj = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (digits.length === 14) {
      this.cpfCnpj = digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else {
      this.cpfCnpj = cliente.cpfCnpj;
    }
    this.email = cliente.email ?? '';
    this.telefone = cliente.telefone ?? '';
    this.celular = cliente.celular ?? '';
    this.cep = cliente.cep ?? '';
    this.endereco = cliente.endereco ?? '';
    this.numero = cliente.numero ?? '';
    this.complemento = cliente.complemento ?? '';
    this.bairro = cliente.bairro ?? '';
    this.cidade = cliente.cidade ?? '';
    this.uf = cliente.uf ?? '';
    this.totalCompras.set(cliente.totalCompras ?? 0);
    this.dataCadastro.set(cliente.dataCadastro);
  }

  formularioValido(): boolean {
    return this.nome.trim().length > 0 &&
      this.cpfCnpj.replace(/\D/g, '').length >= 11;
  }

  salvar() {
    if (!this.formularioValido() || this.salvando) return;

    this.salvando = true;

    const payload: Partial<Cliente> = {
      nome: this.nome.trim(),
      email: this.email.trim() || undefined,
      telefone: this.telefone || undefined,
      celular: this.celular || undefined,
      cep: this.cep || undefined,
      endereco: this.endereco.trim() || undefined,
      numero: this.numero.trim() || undefined,
      complemento: this.complemento.trim() || undefined,
      bairro: this.bairro.trim() || undefined,
      cidade: this.cidade.trim() || undefined,
      uf: this.uf.trim().toUpperCase() || undefined
    };

    // CPF/CNPJ só vai no CREATE (backend não permite alterar)
    if (!this.isEditMode) {
      payload.cpfCnpj = this.cpfCnpj;
    }

    if (this.isEditMode && this.clienteId) {
      this.clienteService.atualizarAPI(this.clienteId, payload).subscribe({
        next: () => {
          this.salvando = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cliente atualizado com sucesso'
          });
          setTimeout(() => this.router.navigate(['/clientes']), 1200);
        },
        error: (err) => {
          this.salvando = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.error?.message || 'Erro ao atualizar cliente'
          });
        }
      });
    } else {
      this.clienteService.criarAPI(payload).subscribe({
        next: () => {
          this.salvando = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cliente cadastrado com sucesso'
          });
          setTimeout(() => this.router.navigate(['/clientes']), 1200);
        },
        error: (err) => {
          this.salvando = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.error?.message || 'Erro ao cadastrar cliente'
          });
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/clientes']);
  }

  formatDate(date?: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
