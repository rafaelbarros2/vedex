export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'admin' | 'vendedor' | 'gerente';
  ativo: boolean;
  dataUltimoLogin?: Date;
}