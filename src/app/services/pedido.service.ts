import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer, switchMap, of, catchError, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HistorialEstado {
  id: number;
  pedido: number;
  estado_anterior: string;
  estado_anterior_label: string;
  estado_nuevo: string;
  estado_nuevo_label: string;
  cambiado_por: number | null;
  cambiado_por_nombre: string;
  comentario: string;
  fecha: string;
}

export interface Pedido {
  id: number;
  cliente: any;
  negocio: number;
  negocio_info?: {
    id: number; nombre: string; categoria: string;
    direccion: string; telefono: string;
  };
  repartidor: any | null;
  estado: 'pendiente' | 'confirmado' | 'en_camino' | 'entregado' | 'cancelado' | 'completado';
  motivo_cancelacion?: string | null;
  estado_label: string;
  total: number | string;
  direccion_entrega: string;
  lat_entrega?: number | null;
  lng_entrega?: number | null;
  detalles: any[];
  historial_estados?: HistorialEstado[];
  created_at: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private api = environment.apiUrl;

  // Estado compartido para polling (HU08 - estados en tiempo real)
  private pedidos$ = new BehaviorSubject<Pedido[]>([]);
  pedidosStream = this.pedidos$.asObservable();
  private pollSub: Subscription | null = null;

  constructor(private http: HttpClient) {}

  listar(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.api}/pedidos/`);
  }

  obtener(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.api}/pedidos/${id}/`);
  }

  historial(id: number): Observable<HistorialEstado[]> {
    return this.http.get<HistorialEstado[]>(`${this.api}/pedidos/${id}/historial/`);
  }

  cambiarEstado(id: number, estado: string, comentario = ''): Observable<any> {
    return this.http.put<any>(`${this.api}/pedidos/${id}/estado/`, { estado, comentario });
  }

  cancelarPedido(id: number, motivo: string = ''): Observable<any> {
  return this.http.put<any>(`${this.api}/pedidos/${id}/cancelar/`, { motivo });
}

completarPedido(id: number): Observable<any> {
  return this.http.put<any>(`${this.api}/pedidos/${id}/completar/`, {});
}

  /**
   * HU08 - Inicia un polling cada N segundos al endpoint /pedidos/.
   * Cualquier componente puede suscribirse a `pedidosStream` y reaccionar
   * a los cambios sin tener que pedir él mismo.
   */
  iniciarPolling(intervaloMs = 10000) {
    this.detenerPolling();
    this.pollSub = timer(0, intervaloMs).pipe(
      switchMap(() => this.listar().pipe(catchError(() => of(this.pedidos$.value))))
    ).subscribe(pedidos => this.pedidos$.next(pedidos));
  }

  detenerPolling() {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = null;
    }
  }

  snapshot(): Pedido[] {
    return this.pedidos$.value;
  }
}