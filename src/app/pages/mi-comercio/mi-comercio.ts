import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { NegocioService, Negocio } from '../../services/negocio.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast';
import { PedidoService } from '../../services/pedido.service';
import { ReporteService, ReporteComercio } from '../../services/reporte.service';
import { environment } from '../../../environments/environment';
import { RegistroValidators, MENSAJES_ERROR, limits } from '../../validators';

@Component({
  selector: 'app-mi-comercio',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, Navbar, Footer],
  templateUrl: './mi-comercio.html',
  styleUrl: './mi-comercio.scss'
})
export class MiComercio implements OnInit {
  private api = environment.apiUrl;

  negocio: Negocio | null = null;
  tabActiva = 'resumen';
  cargando  = true;
  readonly limits = limits;
  soloLetrasInput  = RegistroValidators.soloLetrasInput;
  soloNumerosInput = RegistroValidators.soloNumerosInput;
  
  pedidos: any[] = [];

  // Edición del negocio
  editando  = false;
  guardando = false;
  editError = '';
  editOk    = '';
  editForm!: FormGroup;

  rubros = [
    { valor: 'restaurante', label: '🍴 Restaurante' },
    { valor: 'farmacia',    label: '💊 Farmacia'    },
    { valor: 'bodega',      label: '🏪 Bodega'      },
    { valor: 'mercado',     label: '🛒 Mercado'     },
    { valor: 'postres',     label: '🍰 Postres'     },
    { valor: 'tienda',      label: '🛍️ Tienda'      },
    { valor: 'otro',        label: '📦 Otro'        },
  ];

  dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  diasLabels: Record<string,string> = {
    lunes:'Lun', martes:'Mar', miercoles:'Mié',
    jueves:'Jue', viernes:'Vie', sabado:'Sáb', domingo:'Dom'
  };

  // ── Reportes (HU19) ──────────────────────────────
  reporte: ReporteComercio | null = null;
  cargandoReporte = false;
  errorReporte     = '';
  reporteDesde     = '';
  reporteHasta     = '';
  rangoActivo: number | null = 7;
  mostrarTablaVentas = false;
  hoverVenta: { fecha: string; total: number; x: number; y: number } | null = null;
  private readonly chartW = 600;
  private readonly chartH = 200;
  private readonly chartPad = 28;

  constructor(
    private negocioSvc: NegocioService,
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private toast: ToastService,
    private pedidoSvc: PedidoService,
    private reporteSvc: ReporteService
  ) {
    const hoy = new Date();
    const hace7 = new Date();
    hace7.setDate(hoy.getDate() - 6);
    this.reporteHasta = hoy.toISOString().slice(0, 10);
    this.reporteDesde = hace7.toISOString().slice(0, 10);
  }

  ngOnInit() {
    this.negocioSvc.negocio$.subscribe(n => {
      this.negocio = n;
      this.cargando = false;
      if (n) this.initForm(n);
    });

    if (!this.negocioSvc.negocioActual) {
      this.negocioSvc.cargar().subscribe();
    } else {
      this.cargando = false;
    }

    this.cargarPedidos();
  }

  initForm(n: Negocio) {
  this.editForm = this.fb.group({
    nombre:        [n.nombre ?? '',        [Validators.required, Validators.minLength(limits.nombre_comercial.min), Validators.maxLength(limits.nombre_comercial.max)]],
    descripcion:   [n.descripcion ?? '',   [Validators.maxLength(limits.descripcion.max)]],
    direccion:     [n.direccion ?? '',     [Validators.required, Validators.minLength(limits.direccion.min), Validators.maxLength(limits.direccion.max)]],
    categoria:     [n.categoria ?? '',     Validators.required],
    telefono:      [n.telefono ?? '',      [RegistroValidators.telefonoPeruano]],
    hora_apertura: [n.hora_apertura ?? ''],
    hora_cierre:   [n.hora_cierre ?? ''],
  });

    this.editForm.addValidators(RegistroValidators.horaCierreValida);
    this.editForm.updateValueAndValidity();
  }

  get errorHoraCierre(): string {
    if (!this.editForm?.errors?.['horaCierreInvalida']) return '';
    return MENSAJES_ERROR['hora_cierre']['horaCierreInvalida'];
  }

  getError(campo: string): string {
  const control = this.editForm.get(campo);
    if (!control?.touched || !control.errors) return '';
    const errores = control.errors;
    const mensajes = MENSAJES_ERROR[campo] ?? {};
    const primerError = Object.keys(errores)[0];
    return mensajes[primerError] ?? 'Campo inválido.';
  }

  cargarPedidos() {
    this.http.get<any[]>(`${this.api}/api/pedidos/negocio/`).subscribe({
      next: (data) => this.pedidos = data,
      error: () => {}
    });
  }

  // ── Tabs ──────────────────────────────────────────
  activarTab(tab: string) {
    this.tabActiva = tab;
    this.editando  = false;
    if (tab === 'reportes' && !this.reporte && !this.cargandoReporte) {
      this.cargarReporte();
    }
  }

  // ── Reportes (HU19) ──────────────────────────────

  cargarReporte() {
    this.cargandoReporte = true;
    this.errorReporte    = '';
    this.reporteSvc.porComercio(this.reporteDesde, this.reporteHasta).subscribe({
      next: (data) => {
        this.reporte = data;
        this.cargandoReporte = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorReporte = 'No se pudo cargar el reporte de ventas.';
        this.cargandoReporte = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarRangoReporte(dias: number) {
    const hoy = new Date();
    const desde = new Date();
    desde.setDate(hoy.getDate() - (dias - 1));
    this.reporteHasta = hoy.toISOString().slice(0, 10);
    this.reporteDesde = desde.toISOString().slice(0, 10);
    this.rangoActivo  = dias;
    this.cargarReporte();
  }

  aplicarRangoPersonalizado() {
    this.rangoActivo = null;
    this.cargarReporte();
  }

  toggleTablaVentas() {
    this.mostrarTablaVentas = !this.mostrarTablaVentas;
  }

  get maxCantidadProducto(): number {
    const productos = this.reporte?.productos_mas_vendidos ?? [];
    return productos.length ? Math.max(...productos.map(p => p.cantidad_vendida)) : 0;
  }

  anchoBarraProducto(cantidad: number): number {
    const max = this.maxCantidadProducto;
    return max > 0 ? Math.round((cantidad / max) * 100) : 0;
  }

  get maxVenta(): number {
    const ventas = this.reporte?.ventas_por_dia ?? [];
    return Math.max(1, ...ventas.map(v => v.total));
  }

  puntoX(i: number): number {
    const n = this.reporte?.ventas_por_dia.length ?? 0;
    if (n <= 1) return this.chartW / 2;
    return this.chartPad + i * ((this.chartW - 2 * this.chartPad) / (n - 1));
  }

  puntoY(valor: number): number {
    const max = this.maxVenta;
    return this.chartH - this.chartPad - (max > 0 ? (valor / max) * (this.chartH - 2 * this.chartPad) : 0);
  }

  get lineaPath(): string {
    const ventas = this.reporte?.ventas_por_dia ?? [];
    if (!ventas.length) return '';
    return ventas.map((v, i) => `${i === 0 ? 'M' : 'L'} ${this.puntoX(i)} ${this.puntoY(v.total)}`).join(' ');
  }

  get areaPath(): string {
    const ventas = this.reporte?.ventas_por_dia ?? [];
    if (!ventas.length) return '';
    const base = this.chartH - this.chartPad;
    return `${this.lineaPath} L ${this.puntoX(ventas.length - 1)} ${base} L ${this.puntoX(0)} ${base} Z`;
  }

  mostrarTooltipVenta(v: { fecha: string; total: number }, i: number) {
    this.hoverVenta = { fecha: v.fecha, total: v.total, x: this.puntoX(i), y: this.puntoY(v.total) };
  }

  ocultarTooltipVenta() {
    this.hoverVenta = null;
  }

  // ── Edición ───────────────────────────────────────
  iniciarEdicion() {
    this.editando = true;
    this.editError = '';
    this.editOk    = '';
  }

  cancelarEdicion() {
    this.editando = false;
    if (this.negocio) this.initForm(this.negocio);
  }

  guardar() {
    if (this.editForm.invalid) return;
    this.guardando = true;

    this.http.put<Negocio>(`${this.api}/api/negocios/mi-negocio/`, this.editForm.value).subscribe({
      next: (data) => {
        this.guardando = false;
        this.editando  = false;
        this.negocio = data;
        this.negocioSvc['negocioSubject'].next(data);
        this.toast.mostrarExito('Negocio actualizado correctamente.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.editError = err.error?.detail ?? 'Error al guardar.';
      }
    });
  }

  // ── Helpers ───────────────────────────────────────
  get categoriaLabel(): string {
    return this.rubros.find(r => r.valor === this.negocio?.categoria)?.label ?? '—';
  }

  estadoClass(estado: string): string {
    const m: Record<string,string> = {
      pendiente: 'estado-pendiente',
      confirmado: 'estado-confirmado',
      en_camino: 'estado-camino',
      entregado: 'estado-entregado',
      cancelado:  'estado-cancelado',
      completado: 'estado-completado',
    };
    return m[estado] ?? '';
  }

  completarPedido(p: any, event: Event) {
  event.stopPropagation();
  if (!confirm(`¿Marcar el pedido #${p.id} como completado?`)) return;
  this.pedidoSvc.completarPedido(p.id).subscribe({
    next: () => {
      this.toast.mostrarExito(`Pedido #${p.id} marcado como completado.`);
      this.cargarPedidos();
    },
    error: (err: any) => {
      this.toast.mostrarError(err.error?.error ?? 'No se pudo completar el pedido.');
    }
  });
}

verMotivoCancelacion(p: any, event: Event) {
  event.stopPropagation();
  const motivo = p.motivo_cancelacion?.trim();
  if (motivo) {
    alert(`Motivo de cancelación:\n\n"${motivo}"`);
  }
}

  irACatalogo() {
    this.router.navigate(['/mi-catalogo']);
  }

  irARegistro() {
    this.router.navigate(['/comercio/registro']);
  }
}