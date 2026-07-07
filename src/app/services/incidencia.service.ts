import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type TipoIncidencia =
  | 'pedido_no_llego'
  | 'pedido_incompleto'
  | 'producto_danado'
  | 'repartidor_problema'
  | 'cobro_incorrecto'
  | 'otro';

export type EstadoIncidencia = 'abierto' | 'en_proceso' | 'resuelto' | 'rechazado';

export interface Incidencia {
  id: number;
  pedido: number;
  tipo: TipoIncidencia;
  descripcion: string;
  estado: EstadoIncidencia;
  respuesta?: string | null;
  cliente_nombre?: string;
  created_at: string;
}

export const TIPOS_INCIDENCIA: { value: TipoIncidencia; label: string }[] = [
  { value: 'pedido_no_llego',     label: 'El pedido no llegó' },
  { value: 'pedido_incompleto',   label: 'Pedido incompleto' },
  { value: 'producto_danado',     label: 'Producto dañado o en mal estado' },
  { value: 'repartidor_problema', label: 'Problema con el repartidor' },
  { value: 'cobro_incorrecto',    label: 'Cobro incorrecto' },
  { value: 'otro',                label: 'Otro' },
];

export const ESTADOS_INCIDENCIA: { value: EstadoIncidencia; label: string }[] = [
  { value: 'abierto',    label: 'Abierto' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resuelto',   label: 'Resuelto' },
  { value: 'rechazado',  label: 'Rechazado' },
];

@Injectable({ providedIn: 'root' })
export class IncidenciaService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  crear(pedidoId: number, tipo: TipoIncidencia, descripcion: string): Observable<Incidencia> {
    return this.http.post<Incidencia>(`${this.api}/pedidos/${pedidoId}/incidencias/`, { tipo, descripcion });
  }

  listar(estado?: EstadoIncidencia): Observable<Incidencia[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<Incidencia[]>(`${this.api}/incidencias/`, { params });
  }

  responder(id: number, estado: EstadoIncidencia, respuesta: string): Observable<Incidencia> {
    return this.http.put<Incidencia>(`${this.api}/incidencias/${id}/responder/`, { estado, respuesta });
  }
}
