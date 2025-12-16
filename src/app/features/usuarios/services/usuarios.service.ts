import { Injectable, signal } from '@angular/core';
import { Usuario, UsuarioForm, PerfilUsuario, StatusUsuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  // Estado dos usuários
  usuarios = signal<Usuario[]>([
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao.silva@vendex.com',
      cpf: '123.456.789-00',
      telefone: '(11) 98765-4321',
      perfil: 'admin',
      status: 'ativo',
      dataCadastro: new Date(2024, 0, 15),
      ultimoAcesso: new Date(),
      permissoes: {
        pdv: true,
        produtos: true,
        estoque: true,
        caixa: true,
        relatorios: true,
        usuarios: true,
        configuracoes: true
      }
    },
    {
      id: 2,
      nome: 'Maria Souza',
      email: 'maria.souza@vendex.com',
      cpf: '987.654.321-00',
      telefone: '(11) 91234-5678',
      perfil: 'gerente',
      status: 'ativo',
      dataCadastro: new Date(2024, 1, 20),
      ultimoAcesso: new Date(2024, 9, 28),
      permissoes: {
        pdv: true,
        produtos: true,
        estoque: true,
        caixa: true,
        relatorios: true,
        usuarios: false,
        configuracoes: false
      }
    },
    {
      id: 3,
      nome: 'Carlos Santos',
      email: 'carlos.santos@vendex.com',
      telefone: '(11) 99876-5432',
      perfil: 'vendedor',
      status: 'ativo',
      dataCadastro: new Date(2024, 3, 10),
      ultimoAcesso: new Date(2024, 9, 27),
      permissoes: {
        pdv: true,
        produtos: false,
        estoque: false,
        caixa: false,
        relatorios: false,
        usuarios: false,
        configuracoes: false
      }
    },
    {
      id: 4,
      nome: 'Ana Paula',
      email: 'ana.paula@vendex.com',
      perfil: 'operador',
      status: 'inativo',
      dataCadastro: new Date(2024, 5, 5),
      permissoes: {
        pdv: true,
        produtos: true,
        estoque: true,
        caixa: false,
        relatorios: false,
        usuarios: false,
        configuracoes: false
      }
    }
  ]);

  private proximoId = 5;

  // Obter todos os usuários
  getUsuarios(): Usuario[] {
    return this.usuarios();
  }

  // Obter usuário por ID
  getUsuarioById(id: number): Usuario | undefined {
    return this.usuarios().find(u => u.id === id);
  }

  // Criar novo usuário
  criarUsuario(form: UsuarioForm): Usuario {
    const novoUsuario: Usuario = {
      id: this.proximoId++,
      nome: form.nome,
      email: form.email,
      cpf: form.cpf,
      telefone: form.telefone,
      perfil: form.perfil,
      status: form.status,
      dataCadastro: new Date(),
      permissoes: form.permissoes || this.getPermissoesPadrao(form.perfil)
    };

    this.usuarios.update(usuarios => [...usuarios, novoUsuario]);
    return novoUsuario;
  }

  // Atualizar usuário
  atualizarUsuario(id: number, form: UsuarioForm): Usuario {
    const usuario = this.getUsuarioById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const usuarioAtualizado: Usuario = {
      ...usuario,
      nome: form.nome,
      email: form.email,
      cpf: form.cpf,
      telefone: form.telefone,
      perfil: form.perfil,
      status: form.status,
      permissoes: form.permissoes || usuario.permissoes
    };

    this.usuarios.update(usuarios =>
      usuarios.map(u => (u.id === id ? usuarioAtualizado : u))
    );

    return usuarioAtualizado;
  }

  // Deletar usuário
  deletarUsuario(id: number): void {
    this.usuarios.update(usuarios => usuarios.filter(u => u.id !== id));
  }

  // Alterar status do usuário
  alterarStatus(id: number, status: StatusUsuario): void {
    this.usuarios.update(usuarios =>
      usuarios.map(u => (u.id === id ? { ...u, status } : u))
    );
  }

  // Obter permissões padrão por perfil
  private getPermissoesPadrao(perfil: PerfilUsuario) {
    const permissoesPadrao = {
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

    return permissoesPadrao[perfil];
  }

  // Buscar usuários
  buscarUsuarios(termo: string): Usuario[] {
    const termoLower = termo.toLowerCase();
    return this.usuarios().filter(
      u =>
        u.nome.toLowerCase().includes(termoLower) ||
        u.email.toLowerCase().includes(termoLower) ||
        u.cpf?.includes(termo)
    );
  }

  // Filtrar por perfil
  filtrarPorPerfil(perfil: PerfilUsuario): Usuario[] {
    return this.usuarios().filter(u => u.perfil === perfil);
  }

  // Filtrar por status
  filtrarPorStatus(status: StatusUsuario): Usuario[] {
    return this.usuarios().filter(u => u.status === status);
  }
}
