import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario, UsuarioForm, PerfilUsuario, StatusUsuario } from '../../models/usuario.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputMaskModule,
    CheckboxModule,
    PasswordModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css'
})
export class UsuarioFormComponent implements OnInit {
  usuarioId: number | null = null;
  isEditMode = false;

  // Form fields
  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  cpf = '';
  telefone = '';
  perfil: PerfilUsuario = 'vendedor';
  status: StatusUsuario = 'ativo';

  // Permissões
  permissoes = {
    pdv: false,
    produtos: false,
    estoque: false,
    caixa: false,
    relatorios: false,
    usuarios: false,
    configuracoes: false
  };

  perfisOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Gerente', value: 'gerente' },
    { label: 'Operador', value: 'operador' },
    { label: 'Vendedor', value: 'vendedor' }
  ];

  statusOptions = [
    { label: 'Ativo', value: 'ativo' },
    { label: 'Inativo', value: 'inativo' },
    { label: 'Bloqueado', value: 'bloqueado' }
  ];

  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.usuarioId = parseInt(id);
      this.isEditMode = true;
      this.carregarUsuario();
    } else {
      // Novo usuário - carregar permissões padrão
      this.onPerfilChange();
    }
  }

  carregarUsuario() {
    const usuario = this.usuariosService.getUsuarioById(this.usuarioId!);
    if (!usuario) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Usuário não encontrado'
      });
      this.router.navigate(['/usuarios']);
      return;
    }

    this.nome = usuario.nome;
    this.email = usuario.email;
    this.cpf = usuario.cpf || '';
    this.telefone = usuario.telefone || '';
    this.perfil = usuario.perfil;
    this.status = usuario.status;
    this.permissoes = usuario.permissoes || this.permissoes;
  }

  onPerfilChange() {
    // Atualizar permissões padrão baseado no perfil
    const permissoesPadrao: Record<PerfilUsuario, typeof this.permissoes> = {
      admin: {
        pdv: true,
        produtos: true,
        estoque: true,
        caixa: true,
        relatorios: true,
        usuarios: true,
        configuracoes: true
      },
      gerente: {
        pdv: true,
        produtos: true,
        estoque: true,
        caixa: true,
        relatorios: true,
        usuarios: false,
        configuracoes: false
      },
      operador: {
        pdv: true,
        produtos: true,
        estoque: true,
        caixa: false,
        relatorios: false,
        usuarios: false,
        configuracoes: false
      },
      vendedor: {
        pdv: true,
        produtos: false,
        estoque: false,
        caixa: false,
        relatorios: false,
        usuarios: false,
        configuracoes: false
      }
    };

    this.permissoes = { ...permissoesPadrao[this.perfil] };
  }

  validarFormulario(): boolean {
    if (!this.nome.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Nome é obrigatório'
      });
      return false;
    }

    if (!this.email.trim() || !this.validarEmail(this.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Email inválido'
      });
      return false;
    }

    if (!this.isEditMode) {
      if (!this.senha || this.senha.length < 6) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Senha deve ter no mínimo 6 caracteres'
        });
        return false;
      }

      if (this.senha !== this.confirmarSenha) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'As senhas não conferem'
        });
        return false;
      }
    }

    return true;
  }

  validarEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  salvar() {
    if (!this.validarFormulario()) {
      return;
    }

    const usuarioForm: UsuarioForm = {
      nome: this.nome.trim(),
      email: this.email.trim().toLowerCase(),
      cpf: this.cpf,
      telefone: this.telefone,
      perfil: this.perfil,
      status: this.status,
      permissoes: this.permissoes
    };

    if (!this.isEditMode && this.senha) {
      usuarioForm.senha = this.senha;
    }

    try {
      if (this.isEditMode) {
        this.usuariosService.atualizarUsuario(this.usuarioId!, usuarioForm);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário atualizado com sucesso'
        });
      } else {
        this.usuariosService.criarUsuario(usuarioForm);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário criado com sucesso'
        });
      }

      setTimeout(() => {
        this.router.navigate(['/usuarios']);
      }, 1500);
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: error.message || 'Erro ao salvar usuário'
      });
    }
  }

  cancelar() {
    this.router.navigate(['/usuarios']);
  }
}
