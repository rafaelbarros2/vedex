export type PerfilUsuario = 'admin' | 'gerente' | 'operador' | 'vendedor';
export type StatusUsuario = 'ativo' | 'inativo' | 'bloqueado';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  perfil: PerfilUsuario;
  status: StatusUsuario;
  dataCadastro: Date;
  ultimoAcesso?: Date;
  foto?: string;

  // Permissões específicas (opcional, pode ser expandido)
  permissoes?: {
    pdv: boolean;
    produtos: boolean;
    estoque: boolean;
    caixa: boolean;
    relatorios: boolean;
    usuarios: boolean;
    configuracoes: boolean;
  };
}

export interface UsuarioForm {
  nome: string;
  email: string;
  senha?: string;
  cpf?: string;
  telefone?: string;
  perfil: PerfilUsuario;
  status: StatusUsuario;
  permissoes?: {
    pdv: boolean;
    produtos: boolean;
    estoque: boolean;
    caixa: boolean;
    relatorios: boolean;
    usuarios: boolean;
    configuracoes: boolean;
  };
}
