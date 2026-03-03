import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TenantCreateRequest {
    identificador: string;
    nomeFantasia: string;
    cnpj: string;
    plano: 'BASICO' | 'PROFISSIONAL' | 'EMPRESARIAL';
    emailAdmin: string;
    senhaAdmin: string;
}

export interface TenantSetupResponse {
    tenantId: number;
    identificador: string;
    nomeFantasia: string;
    plano: string;
    status: string;
    schemaNome: string;
    tabelasCriadas: number;
    keycloakRealmCriado: boolean;
    keycloakRealmNome: string;
    usuarioAdminId: number;
    usuarioAdminEmail: string;
    usuarioAdminNome: string;
    keycloakUserId: string;
    mensagem: string;
}

export interface TenantSummary {
    id: number;
    identificador: string;
    nomeFantasia: string;
    cnpj: string;
    plano: string;
    status: string;
    dataExpiracao: string;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/tenants`;

    /**
     * Cria um novo tenant (loja) com schema, Keycloak e usuário ADMIN
     */
    criarLoja(dados: TenantCreateRequest): Observable<TenantSetupResponse> {
        return this.http.post<TenantSetupResponse>(`${this.apiUrl}/setup`, dados);
    }

    /**
     * Lista todos os tenants cadastrados
     */
    listarLojas(): Observable<TenantSummary[]> {
        return this.http.get<TenantSummary[]>(this.apiUrl);
    }

    /**
     * Suspende um tenant
     */
    suspenderLoja(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/suspender`, {});
    }

    /**
     * Reativa um tenant suspenso
     */
    ativarLoja(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/ativar`, {});
    }
}
