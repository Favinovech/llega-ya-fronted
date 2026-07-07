import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PuntoDemanda {
  fecha: string;
  pedidos: number;
}

export interface PrediccionDemanda {
  historico: PuntoDemanda[];
  prediccion: PuntoDemanda[];
  prediccion_manana: number;
}

@Injectable({ providedIn: 'root' })
export class PrediccionService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtener(diasHistorico = 14, diasPrediccion = 7): Observable<PrediccionDemanda> {
    const params = new HttpParams()
      .set('dias_historico', diasHistorico)
      .set('dias_prediccion', diasPrediccion);
    return this.http.get<PrediccionDemanda>(`${this.api}/predicciones/demanda/`, { params });
  }
}
