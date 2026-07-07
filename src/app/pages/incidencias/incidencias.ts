import { Component, OnInit, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { timeout, retry } from 'rxjs';
import {
  IncidenciaService,
  Incidencia,
  EstadoIncidencia,
  TIPOS_INCIDENCIA,
  ESTADOS_INCIDENCIA,
} from '../../services/incidencia.service';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-incidencias',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './incidencias.html',
  styleUrl: './incidencias.scss'
})
export class Incidencias implements OnInit {
  private destroyRef = inject(DestroyRef);
  incidencias: Incidencia[] = [];
  cargando = true;
  errorMsg = '';

  filtroEstado: EstadoIncidencia | '' = '';
  readonly estados = ESTADOS_INCIDENCIA;
  readonly tipos = TIPOS_INCIDENCIA;

  incidenciaSeleccionada: Incidencia | null = null;
  estadoEdicion: EstadoIncidencia = 'abierto';
  respuestaEdicion = '';
  guardando = false;

  constructor(
    private incidenciaSvc: IncidenciaService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarIncidencias();
  }

  cargarIncidencias() {
    this.cargando = true;
    this.errorMsg = '';
    this.incidenciaSvc.listar(this.filtroEstado || undefined).pipe(
      timeout(20000),
      retry({ count: 2, delay: 1500 }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.incidencias = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar las incidencias.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPorEstado() {
    this.cargarIncidencias();
  }

  etiquetaTipo(tipo: string): string {
    return this.tipos.find(t => t.value === tipo)?.label ?? tipo;
  }

  etiquetaEstado(estado: string): string {
    return this.estados.find(e => e.value === estado)?.label ?? estado;
  }

  seleccionarIncidencia(inc: Incidencia) {
    this.incidenciaSeleccionada = inc;
    this.estadoEdicion   = inc.estado;
    this.respuestaEdicion = inc.respuesta ?? '';
  }

  cerrarDetalle() {
    this.incidenciaSeleccionada = null;
  }

  guardarRespuesta() {
    if (!this.incidenciaSeleccionada) return;
    this.guardando = true;

    this.incidenciaSvc.responder(
      this.incidenciaSeleccionada.id,
      this.estadoEdicion,
      this.respuestaEdicion.trim()
    ).subscribe({
      next: (actualizada) => {
        this.guardando = false;
        const idx = this.incidencias.findIndex(i => i.id === actualizada.id);
        if (idx !== -1) this.incidencias[idx] = actualizada;
        this.incidenciaSeleccionada = actualizada;
        this.toast.mostrarExito('Respuesta guardada correctamente.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardando = false;
        this.toast.mostrarError('No se pudo guardar la respuesta.');
        this.cdr.detectChanges();
      }
    });
  }
}
