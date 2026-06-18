import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Producto {
  id?: number;
  negocio?: number;
  nombre: string;
  descripcion?: string;
  precio: number | string;
  categoria: string;
  categoria_label?: string;
  disponible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HistorialCambio {
  id: number;
  producto: number;
  producto_nombre: string;
  usuario: number | null;
  usuario_nombre: string;
  tipo_cambio: string;
  tipo_cambio_label: string;
  valor_anterior: string;
  valor_nuevo: string;
  comentario: string;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private api = `${environment.apiUrl}/negocio`;

  constructor(private http: HttpClient) {}

  // HU05
  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.api}/productos/`);
  }
  crear(data: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(`${this.api}/productos/`, data);
  }
  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.api}/productos/${id}/`);
  }
  actualizar(id: number, data: Partial<Producto>): Observable<any> {
    return this.http.patch<any>(`${this.api}/productos/${id}/`, data);
  }
  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/productos/${id}/`);
  }

  // HU06
  cambiarPrecio(id: number, precio: number, comentario = ''): Observable<any> {
    return this.http.patch<any>(`${this.api}/productos/${id}/precio/`, { precio, comentario });
  }
  toggleDisponibilidad(id: number): Observable<any> {
    return this.http.patch<any>(`${this.api}/productos/${id}/disponibilidad/`, {});
  }
  historialDeProducto(id: number): Observable<HistorialCambio[]> {
    return this.http.get<HistorialCambio[]>(`${this.api}/productos/${id}/historial/`);
  }
  historialCatalogo(filtros: { tipo?: string; dias?: number } = {}): Observable<HistorialCambio[]> {
    let params = new HttpParams();
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.dias) params = params.set('dias', String(filtros.dias));
    return this.http.get<HistorialCambio[]>(`${this.api}/catalogo/historial/`, { params });
  }
}