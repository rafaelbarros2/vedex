import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, map } from 'rxjs';
import { Usuario, UsuarioForm, PerfilUsuario, StatusUsuario } from '../models/usuario.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  usuarios = signal<Usuario[]>([]);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  private converterDTOParaModel(dto: any): Usuario {
    return {
      id: dto.id,
      nome: dto.nome,
      email: dto.email,
      cpf: dto.cpf,
      telefone: dto.telefone,
      perfil: dto.perfil?.toLowerCase() as PerfilUsuario,
      status: dto.status?.toLowerCase() as StatusUsuario,
      dataCadastro: dto.dataCadastro ? new Date(dto.dataCadastro) : new Date(),
      ultimoAcesso: dto.ultimoAcesso ? new Date(dto.ultimoAcesso) : undefined,
      foto: dto.foto,
      permissoes: dto.permissoes ? {
        pdv: dto.permissoes.pdv ?? false,
        produtos: dto.permissoes.produtos ?? false,
        estoque: dto.permissoes.estoque ?? false,
        caixa: dto.permissoes.caixa ?? false,
        relatorios: dto.permissoes.relatorios ?? false,
        usuarios: dto.permissoes.usuarios ?? false,
        configuracoes: dto.permissoes.configuracoes ?? false
      } : undefined
    };
  }

  private converterModelParaDTO(form: UsuarioForm, isCreate: boolean = false): any {
    const dto: any = {
      nome: form.nome,
      email: form.email,
      cpf: form.cpf || undefined,
      telefone: form.telefone || undefined,
      perfil: form.perfil?.toUpperCase(),
      status: form.status?.toUpperCase(),
      permissoes: form.permissoes ? {
        pdv: form.permissoes.pdv,
        produtos: form.permissoes.produtos,
        estoque: form.permissoes.estoque,
        caixa: form.permissoes.caixa,
        relatorios: form.permissoes.relatorios,
        usuarios: form.permissoes.usuarios,
        configuracoes: form.permissoes.configuracoes
      } : undefined
    };

    if (isCreate && form.senha) {
      dto.senha = form.senha;
    }

    return dto;
  }

  // --- Métodos de API ---

  listarTodosAPI(): Observable<Usuario[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap(lista => {
          const convertidos = lista.map(u => this.converterDTOParaModel(u));
          this.usuarios.set(convertidos);
        }),
        map(lista => lista.map(u => this.converterDTOParaModel(u))),
        catchError(error => {
          console.error('Erro ao listar usuários:', error);
          throw error;
        })
      );
  }

  buscarPorIdAPI(id: number): Observable<Usuario> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(dto => this.converterDTOParaModel(dto)),
        catchError(error => {
          console.error('Erro ao buscar usuário:', error);
          throw error;
        })
      );
  }

  criarAPI(form: UsuarioForm): Observable<Usuario> {
    const dto = this.converterModelParaDTO(form, true);
    return this.http.post<any>(this.apiUrl, dto, { headers: this.getHeaders() })
      .pipe(
        tap(novoUsuario => {
          const convertido = this.converterDTOParaModel(novoUsuario);
          this.usuarios.update(lista => [...lista, convertido]);
        }),
        map(novoUsuario => this.converterDTOParaModel(novoUsuario)),
        catchError(error => {
          console.error('Erro ao criar usuário:', error);
          throw error;
        })
      );
  }

  atualizarAPI(id: number, form: UsuarioForm): Observable<Usuario> {
    const dto = this.converterModelParaDTO(form, false);
    return this.http.put<any>(`${this.apiUrl}/${id}`, dto, { headers: this.getHeaders() })
      .pipe(
        tap(atualizado => {
          const convertido = this.converterDTOParaModel(atualizado);
          this.usuarios.update(lista => lista.map(u => u.id === id ? convertido : u));
        }),
        map(atualizado => this.converterDTOParaModel(atualizado)),
        catchError(error => {
          console.error('Erro ao atualizar usuário:', error);
          throw error;
        })
      );
  }

  ativarAPI(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/ativar`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          this.usuarios.update(lista =>
            lista.map(u => u.id === id ? { ...u, status: 'ativo' as StatusUsuario } : u)
          );
        }),
        catchError(error => {
          console.error('Erro ao ativar usuário:', error);
          throw error;
        })
      );
  }

  inativarAPI(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/inativar`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          this.usuarios.update(lista =>
            lista.map(u => u.id === id ? { ...u, status: 'inativo' as StatusUsuario } : u)
          );
        }),
        catchError(error => {
          console.error('Erro ao inativar usuário:', error);
          throw error;
        })
      );
  }

  bloquearAPI(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/bloquear`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          this.usuarios.update(lista =>
            lista.map(u => u.id === id ? { ...u, status: 'bloqueado' as StatusUsuario } : u)
          );
        }),
        catchError(error => {
          console.error('Erro ao bloquear usuário:', error);
          throw error;
        })
      );
  }

  alterarSenhaAPI(id: number, senhaAtual: string, novaSenha: string, confirmarSenha: string): Observable<void> {
    const dto = { senhaAtual, novaSenha, confirmarSenha };
    return this.http.patch<void>(`${this.apiUrl}/${id}/senha`, dto, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erro ao alterar senha:', error);
          throw error;
        })
      );
  }

  // --- Métodos locais (fallback / acesso ao signal) ---

  getUsuarios(): Usuario[] {
    return this.usuarios();
  }

  getUsuarioById(id: number): Usuario | undefined {
    return this.usuarios().find(u => u.id === id);
  }

  criarUsuario(form: UsuarioForm): Usuario {
    const novoUsuario: Usuario = {
      id: Date.now(),
      nome: form.nome,
      email: form.email,
      cpf: form.cpf,
      telefone: form.telefone,
      perfil: form.perfil,
      status: form.status,
      dataCadastro: new Date(),
      permissoes: form.permissoes || this.getPermissoesPadrao(form.perfil)
    };
    this.usuarios.update(lista => [...lista, novoUsuario]);
    return novoUsuario;
  }

  atualizarUsuario(id: number, form: UsuarioForm): Usuario {
    const usuario = this.getUsuarioById(id);
    if (!usuario) throw new Error('Usuário não encontrado');
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
    this.usuarios.update(lista => lista.map(u => u.id === id ? usuarioAtualizado : u));
    return usuarioAtualizado;
  }

  deletarUsuario(id: number): void {
    this.usuarios.update(lista => lista.filter(u => u.id !== id));
  }

  alterarStatus(id: number, status: StatusUsuario): void {
    this.usuarios.update(lista => lista.map(u => u.id === id ? { ...u, status } : u));
  }

  getPermissoesPadrao(perfil: PerfilUsuario) {
    const permissoesPadrao = {
      admin:    { pdv: true,  produtos: true,  estoque: true,  caixa: true,  relatorios: true,  usuarios: true,  configuracoes: true  },
      gerente:  { pdv: true,  produtos: true,  estoque: true,  caixa: true,  relatorios: true,  usuarios: false, configuracoes: false },
      operador: { pdv: true,  produtos: true,  estoque: true,  caixa: false, relatorios: false, usuarios: false, configuracoes: false },
      vendedor: { pdv: true,  produtos: false, estoque: false, caixa: false, relatorios: false, usuarios: false, configuracoes: false }
    };
    return permissoesPadrao[perfil];
  }

  buscarUsuarios(termo: string): Usuario[] {
    const termoLower = termo.toLowerCase();
    return this.usuarios().filter(
      u =>
        u.nome.toLowerCase().includes(termoLower) ||
        u.email.toLowerCase().includes(termoLower) ||
        u.cpf?.includes(termo)
    );
  }

  filtrarPorPerfil(perfil: PerfilUsuario): Usuario[] {
    return this.usuarios().filter(u => u.perfil === perfil);
  }

  filtrarPorStatus(status: StatusUsuario): Usuario[] {
    return this.usuarios().filter(u => u.status === status);
  }
}
