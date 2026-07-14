import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PagoDistribucion {
  id: number;
  pedido: number;
  fecha: string;
  metodo: string;
  monto_total: number;
  comision_plataforma: number;
  monto_comercio: number;
  monto_repartidor: number;
  negocio_nombre?: string;
  repartidor_nombre?: string;
}

@Injectable({ providedIn: 'root' })
export class PagoService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(desde?: string, hasta?: string): Observable<PagoDistribucion[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta)  params = params.set('hasta', hasta);
    return this.http.get<PagoDistribucion[]>(`${this.api}/api/pedidos/pagos/`, { params });
  }
}
