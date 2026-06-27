import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { NegocioService, Negocio } from '../../services/negocio.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast';
import { PedidoService } from '../../services/pedido.service';
import { environment } from '../../../environments/environment';
import { RegistroValidators, MENSAJES_ERROR, limits } from '../../validators';

@Component({
  selector: 'app-mi-comercio',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Navbar, Footer],
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

  constructor(
    private negocioSvc: NegocioService,
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private toast: ToastService,
    private pedidoSvc: PedidoService
  ) {}

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
    this.http.get<any[]>(`${this.api}/pedidos/`).subscribe({
      next: (data) => this.pedidos = data,
      error: () => {}
    });
  }

  // ── Tabs ──────────────────────────────────────────
  activarTab(tab: string) {
    this.tabActiva = tab;
    this.editando  = false;
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

    this.http.put<Negocio>(`${this.api}/negocio/`, this.editForm.value).subscribe({
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