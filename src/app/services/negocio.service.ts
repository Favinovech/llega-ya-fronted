import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Negocio {
  id:            number;
  nombre:        string;
  descripcion:   string;
  direccion:     string;
  categoria:     string;
  activo:        boolean;
  ruc:           string;
  razon_social:  string;
  telefono:      string;
  hora_apertura: string;
  hora_cierre:   string;
  dias_atencion: string[];
  created_at:    string;
}

@Injectable({ providedIn: 'root' })
export class NegocioService {
  private api = environment.apiUrl;

  // BehaviorSubject: cualquier componente puede suscribirse a cambios
  private negocioSubject = new BehaviorSubject<Negocio | null>(null);
  private cargado = false;

  negocio$ = this.negocioSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Llama al backend y cachea el resultado
  cargar(): Observable<Negocio | null> {
    if (this.cargado) {
    return of(this.negocioSubject.value);
    }
    
    return this.http.get<Negocio>(`${this.api}/negocio/`).pipe(
      tap(n => {
        this.negocioSubject.next(n);
        this.cargado = true;
      }),
      catchError(() => {
        // 404 = no tiene negocio, no es error crítico
        this.negocioSubject.next(null);
        this.cargado = true;
        return of(null);
      })
    );
  }

  // Para saber rápido si tiene negocio (sin suscripción)
  get tieneNegocio(): boolean {
    return this.negocioSubject.value !== null;
  }

  actualizar(negocio: Negocio): void {
  this.negocioSubject.next(negocio);
  }
  
  get negocioActual(): Negocio | null {
    return this.negocioSubject.value;
  }

  // Llama después de registrar un comercio para refrescar
  refrescar(): void {
    this.cargado = false;
    this.cargar().subscribe();
  }

  // Limpia al hacer logout
  limpiar(): void {
    this.negocioSubject.next(null);
    this.cargado = false;
  }
}