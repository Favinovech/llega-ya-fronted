import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Calificacion {
  id: number;
  pedido: number;
  estrellas: number;
  comentario: string;
  fecha: string;
}

export interface PromedioCalificacion {
  promedio: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CalificacionService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  calificar(pedidoId: number, estrellas: number, comentario: string): Observable<Calificacion> {
    return this.http.post<Calificacion>(`${this.api}/pedidos/${pedidoId}/calificar/`, { estrellas, comentario });
  }

  obtenerCalificacion(pedidoId: number): Observable<Calificacion> {
    return this.http.get<Calificacion>(`${this.api}/pedidos/${pedidoId}/calificacion/`);
  }

  promedioMio(): Observable<PromedioCalificacion> {
    return this.http.get<PromedioCalificacion>(`${this.api}/repartidor/calificaciones/promedio/`);
  }
}
