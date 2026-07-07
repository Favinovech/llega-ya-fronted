import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReporteDiario {
  fecha: string;
  total_pedidos: number;
  ingresos: number;
  cancelaciones: number;
}

export interface ProductoVendido {
  producto_id: number;
  nombre: string;
  cantidad_vendida: number;
  ingresos: number;
}

export interface VentaPorDia {
  fecha: string;
  total: number;
}

export interface ReporteComercio {
  ventas_totales: number;
  productos_mas_vendidos: ProductoVendido[];
  ventas_por_dia: VentaPorDia[];
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  diario(fecha?: string): Observable<ReporteDiario> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<ReporteDiario>(`${this.api}/reportes/diario/`, { params });
  }

  porComercio(desde?: string, hasta?: string): Observable<ReporteComercio> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta)  params = params.set('hasta', hasta);
    return this.http.get<ReporteComercio>(`${this.api}/negocio/reporte/`, { params });
  }
}
