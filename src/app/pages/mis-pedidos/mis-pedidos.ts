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
import { environment } from '../../../environments/environment';

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

  // Modal pago
  mostrarModalPago  = false;
  pedidoAPagar: Pedido | null = null;
  metodoPago        = 'tarjeta';
  pagando           = false;
  pagoExitoso: Pago | null = null;

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private calificacionSvc: CalificacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    this.errorMsg = '';
    this.http.get<Pedido[]>(`${this.api}/pedidos/`).pipe(
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

    this.http.put(`${this.api}/pedidos/${this.pedidoAcancelar.id}/cancelar/`, {
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
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.enviandoCalificacion = false;
        this.toast.mostrarError(err.error?.error ?? 'No se pudo enviar la calificación.');
      }
    });
  }

  // ── Modal pago ───────────────────────────────────

  abrirModalPago(pedido: Pedido) {
    this.pedidoAPagar     = pedido;
    this.metodoPago       = 'tarjeta';
    this.pagando          = false;
    this.pagoExitoso      = null;
    this.mostrarModalPago = true;
  }

  cerrarModalPago() {
    this.mostrarModalPago = false;
    this.pagoExitoso      = null;
    this.cdr.detectChanges();
  }

  confirmarPago() {
    if (!this.pedidoAPagar || this.pagando) return;
    this.pagando = true;

    this.http.post<any>(`${this.api}/pedidos/${this.pedidoAPagar.id}/pagar/`, {
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
        this.pagando = false;
        this.toast.mostrarError(err.error?.error ?? 'No se pudo procesar el pago.');
        this.cdr.detectChanges();
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
