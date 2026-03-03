import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FluxoCaixa } from '../models/fluxo-caixa.model';

@Injectable({ providedIn: 'root' })
export class FluxoCaixaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/financeiro/fluxo-caixa`;

  getFluxoCaixa(dataInicio: string, dataFim: string): Observable<FluxoCaixa> {
    const params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);
    return this.http.get<FluxoCaixa>(this.apiUrl, { params });
  }
}
