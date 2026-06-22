import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RepartidorService } from '../../services/repartidor.service';
import { PedidoService } from '../../services/pedido.service';
import { Footer } from '../components/footer/footer';

@Component({
  selector: 'app-repartidor-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Footer],
  templateUrl: './repartidor-home.html',
  styleUrl: './repartidor-home.scss'
})

export class RepartidorHome implements OnInit, OnDestroy {
  private intervaloPedidos: any;
  usuario: any = null;
  perfil: any  = null;

  disponible    = true;
  mostrarEditor = false;
  guardando     = false;
  errorMsg      = '';
  exitoMsg      = '';

  pedidosDisponibles: any[] = [];
  cargandoDisponibles = false;
  tomandoId: number | null = null;

  tabActiva: 'entregas' | 'disponibles' = 'entregas';
  pedidos: any[] = [];
  cargandoPedidos = false;
  actualizandoId: number | null = null;

  perfilForm!: FormGroup;

  get iniciales(): string {
    if (!this.usuario) return '?';
    return `${this.usuario.nombre?.[0] ?? ''}${this.usuario.apellido?.[0] ?? ''}`.toUpperCase();
  }

  get vehiculoLabel(): string {
    const map: Record<string, string> = {
      moto:      'Moto',
      bicicleta: 'Bicicleta',
      a_pie:     'A pie',
      auto:      'Auto',
    };
    return map[this.perfil?.vehiculo] ?? '-';
  }

  get zona(): string {
    return this.perfil?.zona_cobertura ?? '';
  }

  get totalPedidos(): number {
    return 0;
  }

  constructor(
    private auth: AuthService,
    private repartidorSvc: RepartidorService,
    private pedidoSvc: PedidoService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuario = this.auth.getUsuario();
    this.perfilForm = this.fb.group({
      dni:            [''],
      vehiculo:       ['moto'],
      zona_cobertura: [''],
    });
    this.cargarPerfil();
    this.cargarPedidos();
    this.cargarDisponibles();

    this.intervaloPedidos = setInterval(() => {
    this.refrescarPedidos();
    this.refrescarDisponibles();
    }, 10000);
  }

  ngOnDestroy() {
    clearInterval(this.intervaloPedidos);
  }

  cargarPerfil() {
    this.repartidorSvc.getPerfil().subscribe({
      next: (data: any) => {
        this.perfil     = data;
        this.disponible = data.disponible ?? true;
        this.perfilForm.patchValue({
          dni:            data.dni,
          vehiculo:       data.vehiculo,
          zona_cobertura: data.zona_cobertura,
        });
      },
      error: () => {
        this.perfil = null;
      }
    });
  }

  toggleDisponibilidad() {
    this.disponible = !this.disponible;
    this.repartidorSvc.actualizarPerfil({ disponible: this.disponible }).subscribe();
  }

  guardarPerfil() {
    this.guardando = true;
    this.errorMsg  = '';
    this.exitoMsg  = '';

    this.repartidorSvc.actualizarPerfil(this.perfilForm.value).subscribe({
      next: (data: any) => {
        this.guardando     = false;
        this.perfil        = data;
        this.exitoMsg      = 'Perfil actualizado correctamente.';
        this.mostrarEditor = false;
        setTimeout(() => this.exitoMsg = '', 3000);
      },
      error: () => {
        this.guardando = false;
        this.errorMsg  = 'Error al guardar. Intenta de nuevo.';
      }
    });
  }

  cargarPedidos() {
    this.cargandoPedidos = true;
    this.pedidoSvc.listar().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cargandoPedidos = false;
      },
      error: () => {
        this.cargandoPedidos = false;
      }
    });
  }

  cargarDisponibles() {
    this.cargandoDisponibles = true;
    this.repartidorSvc.getPedidosDisponibles().subscribe({
      next: (data) => {
        this.pedidosDisponibles = data;
        this.cargandoDisponibles = false;
      },
      error: () => { this.cargandoDisponibles = false; }
    });
  }

  tomarPedido(id: number) {
    this.tomandoId = id;
    this.pedidosDisponibles = this.pedidosDisponibles.filter((p: any) => p.id !== id);
    this.repartidorSvc.tomarPedido(id).subscribe({
      next: () => {
        this.tomandoId = null;
        this.refrescarPedidos();
        this.tabActiva = 'entregas';
      },
      error: () => {
        this.tomandoId = null;
        this.refrescarDisponibles();
      }
    });
  }

  private refrescarPedidos() {
    this.pedidoSvc.listar().subscribe({
      next: (data) => { this.pedidos = data; }
    });
  }

  private refrescarDisponibles() {
    this.repartidorSvc.getPedidosDisponibles().subscribe({
     next: (data) => { this.pedidosDisponibles = data; }
    });
  }

  actualizarEstado(id: number, estado: 'en_camino' | 'entregado') {
    this.pedidos = this.pedidos.map((p: any) =>
      p.id === id ? { ...p, estado } : p
    );
    this.pedidoSvc.cambiarEstado(id, estado).subscribe({
      next: () => { this.refrescarPedidos(); },
      error: () => { this.refrescarPedidos(); }
    });
  }
  
  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente:  'Pendiente',
      confirmado: 'Confirmado',
      en_camino:  'En camino',
      entregado:  'Entregado',
      cancelado:  'Cancelado',
      completado: 'Completado',
    };
    return map[estado] ?? estado;
  }

  salir() {
    this.auth.logout();
  }
}