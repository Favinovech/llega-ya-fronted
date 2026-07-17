import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RepartidorService {
  private api = `${environment.apiUrl}/api/repartidores`;

  constructor(private http: HttpClient) {}

  getPerfil() {
    return this.http.get<any>(`${this.api}/perfil/`);
  }

  actualizarPerfil(data: any) {
    return this.http.put<any>(`${this.api}/perfil/`, data);
  }

  getPedidosDisponibles() {
  return this.http.get<any[]>(`${this.api}/pedidos-disponibles/`);
  }

  getMisEntregas() {
  return this.http.get<any[]>(`${environment.apiUrl}/api/pedidos/mis-entregas/`);
  }

  tomarPedido(id: number) {
  return this.http.post<any>(`${this.api}/pedidos/${id}/tomar/`, {});
  }
}