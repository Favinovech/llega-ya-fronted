import { Component, OnInit, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { timeout, retry } from 'rxjs';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { ToastService } from '../../services/toast';
import { CalificacionService, Calificacion } from '../../services/calificacion.service';
import { IncidenciaService, Incidencia, TipoIncidencia, TIPOS_INCIDENCIA } from '../../services/incidencia.service';
import { environment } from '../../../environments/environment';
import { limits, RegistroValidators } from '../../validators';

interface Pago {
  id: number;
  pedido: number;
  monto: string;
  metodo: string;
  numero_transaccion: string;
  fecha: string;
}

interface DetallePedido {
  id: number;
  producto: number;
  cantidad: number;
  precio_unitario: string;
}

interface Pedido {
  id: number;
  estado: string;
  total: string;
  direccion_entrega: string;
  created_at: string;
  negocio: number;
  repartidor?: any | null;
  detalles: DetallePedido[];
  motivo_cancelacion?: string | null;
  calificacion?: Calificacion | null;
  pago?: Pago | null;
  incidencia?: Incidencia | null;
}

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Navbar, Footer],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.scss'
})
export class MisPedidos implements OnInit {
  private api        = environment.apiUrl;
  private destroyRef = inject(DestroyRef);
  pedidos: Pedido[] = [];
  cargando  = true;
  errorMsg  = '';

  // Modal cancelación
  mostrarModal       = false;
  pedidoAcancelar: Pedido | null = null;
  motivoCancelacion  = '';

  // Modal calificación
  mostrarModalCalificacion  = false;
  pedidoACalificar: Pedido | null = null;
  estrellasSeleccionadas    = 0;
  hoverEstrella             = 0;
  comentarioCalificacion    = '';
  enviandoCalificacion      = false;
  readonly estrellas        = [1, 2, 3, 4, 5];
  readonly limits = limits;
  readonly soloNumerosInput = RegistroValidators.soloNumerosInput;
  // Modal pago
  mostrarModalPago  = false;
  pedidoAPagar: Pedido | null = null;
  metodoPago        = 'tarjeta';
  pagando           = false;
  pagoExitoso: Pago | null = null;
  tarjetaNumero      = '';
  tarjetaVencimiento = '';
  tarjetaCvv         = '';
  tarjetaNombre      = '';

  // Modal incidencia
  mostrarModalIncidencia  = false;
  pedidoAIncidencia: Pedido | null = null;
  tipoIncidencia: TipoIncidencia = 'pedido_no_llego';
  descripcionIncidencia   = '';
  enviandoIncidencia      = false;
  readonly tiposIncidencia = TIPOS_INCIDENCIA;

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private calificacionSvc: CalificacionService,
    private incidenciaSvc: IncidenciaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    this.errorMsg = '';
    this.http.get<Pedido[]>(`${this.api}/api/pedidos/mis-pedidos/`).pipe(
      timeout(20000),
      retry({ count: 2, delay: 1500 }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.pedidos  = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar los pedidos.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Modal cancelación ────────────────────────────

  abrirModalCancelacion(pedido: Pedido) {
    this.pedidoAcancelar    = pedido;
    this.motivoCancelacion  = '';
    this.mostrarModal       = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.cdr.detectChanges();
  }

  confirmarCancelacion() {
    if (!this.pedidoAcancelar) return;

    this.http.put(`${this.api}/api/pedidos/${this.pedidoAcancelar.id}/cancelar/`, {
      motivo: this.motivoCancelacion.trim()
    }).subscribe({
      next: () => {
        this.toast.mostrarExito('Pedido cancelado correctamente.');
        this.cerrarModal();
        this.cargarPedidos();
      },
      error: (err: any) => {
        this.toast.mostrarError(err.error?.error ?? 'No se pudo cancelar.');
      }
    });
  }

  // ── Modal calificación ───────────────────────────

  puedeCalificar(pedido: Pedido): boolean {
    return (pedido.estado === 'entregado' || pedido.estado === 'completado')
      && !pedido.calificacion;
  }

  abrirModalCalificacion(pedido: Pedido) {
    this.pedidoACalificar         = pedido;
    this.estrellasSeleccionadas   = 0;
    this.hoverEstrella            = 0;
    this.comentarioCalificacion   = '';
    this.enviandoCalificacion     = false;
    this.mostrarModalCalificacion = true;
  }

  cerrarModalCalificacion() {
    this.mostrarModalCalificacion = false;
    this.cdr.detectChanges();
  }

  seleccionarEstrella(n: number) {
    this.estrellasSeleccionadas = n;
  }

  estrellaActiva(n: number): boolean {
    return n <= (this.hoverEstrella || this.estrellasSeleccionadas);
  }

  etiquetaEstrellas(): string {
    const labels: Record<number, string> = {
      1: 'Muy malo',
      2: 'Malo',
      3: 'Regular',
      4: 'Bueno',
      5: 'Excelente',
    };
    return labels[this.hoverEstrella || this.estrellasSeleccionadas] ?? 'Selecciona una calificación';
  }

  enviarCalificacion() {
    if (!this.pedidoACalificar || !this.estrellasSeleccionadas) return;
    this.enviandoCalificacion = true;

    this.calificacionSvc.calificar(
      this.pedidoACalificar.id,
      this.estrellasSeleccionadas,
      this.comentarioCalificacion.trim()
    ).subscribe({
      next: (cal) => {
        const pedido = this.pedidos.find(p => p.id === this.pedidoACalificar!.id);
        if (pedido) pedido.calificacion = cal;
        this.toast.mostrarExito('¡Gracias por tu calificación!');
        this.cerrarModalCalificacion();
      },
      error: (err: any) => {
        this.enviandoCalificacion = false;
        const mensaje = err.status === 404
          ? 'La calificación de repartidores no está disponible en este momento.'
          : (err.error?.error ?? 'No se pudo enviar la calificación.');
        this.toast.mostrarError(mensaje);
        this.cdr.detectChanges();
      }
    });
  }

  // ── Modal incidencia (HU16) ──────────────────────

  puedeReportarIncidencia(pedido: Pedido): boolean {
    return pedido.estado !== 'cancelado' && !pedido.incidencia;
  }

  abrirModalIncidencia(pedido: Pedido) {
    this.pedidoAIncidencia       = pedido;
    this.tipoIncidencia          = 'pedido_no_llego';
    this.descripcionIncidencia   = '';
    this.enviandoIncidencia      = false;
    this.mostrarModalIncidencia  = true;
  }

  cerrarModalIncidencia() {
    this.mostrarModalIncidencia = false;
    this.cdr.detectChanges();
  }

  etiquetaEstadoIncidencia(estado: string): string {
    const mapa: Record<string, string> = {
      abierto:    'Abierto',
      en_proceso: 'En proceso',
      resuelto:   'Resuelto',
      rechazado:  'Rechazado',
    };
    return mapa[estado] ?? estado;
  }

  enviarIncidencia() {
    if (!this.pedidoAIncidencia || !this.descripcionIncidencia.trim()) return;
    this.enviandoIncidencia = true;

    this.incidenciaSvc.crear(
      this.pedidoAIncidencia.id,
      this.tipoIncidencia,
      this.descripcionIncidencia.trim()
    ).subscribe({
      next: (inc) => {
        const pedido = this.pedidos.find(p => p.id === this.pedidoAIncidencia!.id);
        if (pedido) pedido.incidencia = inc;
        this.toast.mostrarExito('Incidencia registrada. Te contactaremos pronto.');
        this.cerrarModalIncidencia();
      },
      error: (err: any) => {
        this.enviandoIncidencia = false;
        const mensaje = err.status === 404
          ? 'El registro de incidencias no está disponible en este momento.'
          : (err.error?.error ?? 'No se pudo registrar la incidencia.');
        this.toast.mostrarError(mensaje);
        this.cdr.detectChanges();
      }
    });
  }

  // ── Modal pago ───────────────────────────────────

  abrirModalPago(pedido: Pedido) {
    this.http.get<any>(`${this.api}/api/pedidos/${pedido.id}/detalle/`).subscribe({
      next: (detalle) => {
        if (detalle.pago) {
          const idx = this.pedidos.findIndex(p => p.id === pedido.id);
          if (idx !== -1) this.pedidos[idx] = { ...this.pedidos[idx], pago: detalle.pago };
          this.cdr.detectChanges();
          this.toast.mostrarError('Este pedido ya fue pagado.');
          return;
        }
        this.pedidoAPagar     = pedido;
        this.metodoPago       = 'tarjeta';
        this.pagando          = false;
        this.pagoExitoso      = null;
        this.resetFormularioTarjeta();
        this.mostrarModalPago = true;
        this.cdr.detectChanges();
      },
      error: () => {
        // No se pudo verificar el estado real del pedido: no abrir el modal
        // para evitar pagar un pedido que ya podría estar pagado.
        this.toast.mostrarError('No se pudo verificar el estado del pedido. Intenta de nuevo.');
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModalPago() {
    this.mostrarModalPago = false;
    this.pagoExitoso      = null;
    this.cdr.detectChanges();
  }

  resetFormularioTarjeta() {
    this.tarjetaNumero      = '';
    this.tarjetaVencimiento = '';
    this.tarjetaCvv         = '';
    this.tarjetaNombre      = '';
  }

  tarjetaValida(): boolean {
    if (this.metodoPago !== 'tarjeta') return true;
    const numeroOk = /^\d{16}$/.test(this.tarjetaNumero.replace(/\s/g, ''));
    const vencimientoOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(this.tarjetaVencimiento.trim());
    const cvvOk = /^\d{3}$/.test(this.tarjetaCvv.trim());
    const nombreOk = this.tarjetaNombre.trim().length > 0;
    return numeroOk && vencimientoOk && cvvOk && nombreOk;
  }

  confirmarPago() {
    if (!this.pedidoAPagar || this.pagando || !this.tarjetaValida()) return;
    this.pagando = true;

    this.http.post<any>(`${this.api}/api/pedidos/${this.pedidoAPagar.id}/pagar/`, {
      metodo: this.metodoPago
    }).subscribe({
      next: (res) => {
        this.pagando     = false;
        this.pagoExitoso = res.pedido.pago;
        const idx = this.pedidos.findIndex(p => p.id === this.pedidoAPagar!.id);
        if (idx !== -1) this.pedidos[idx] = res.pedido;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const pedidoId = this.pedidoAPagar!.id;
        // Antes de reintentar, re-verificamos el estado real en el servidor:
        // así evitamos permitir un segundo intento de pago sobre un pedido
        // que en realidad sí se llegó a pagar (p. ej. timeout de red).
        this.http.get<any>(`${this.api}/api/pedidos/${pedidoId}/detalle/`).subscribe({
          next: (detalle) => {
            this.pagando = false;
            const idx = this.pedidos.findIndex(p => p.id === pedidoId);
            if (detalle.pago) {
              if (idx !== -1) this.pedidos[idx] = { ...this.pedidos[idx], pago: detalle.pago };
              this.pagoExitoso = detalle.pago;
            } else {
              this.toast.mostrarError(err.error?.error ?? 'No se pudo procesar el pago.');
            }
            this.cdr.detectChanges();
          },
          error: () => {
            this.pagando = false;
            this.toast.mostrarError('No se pudo confirmar el estado del pago. Verifica "Mis Pedidos" antes de reintentar.');
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  // ── Helpers ──────────────────────────────────────

  etiquetaEstado(estado: string): string {
    const mapa: Record<string, string> = {
      pendiente:  'Pendiente',
      confirmado: 'Confirmado',
      en_camino:  'En camino',
      entregado:  'Entregado',
      cancelado:  'Cancelado',
      completado: 'Completado'
    };
    return mapa[estado] ?? estado;
  }

  claseEstado(estado: string): string {
    return `estado-${estado}`;
  }

  rango(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }
}
