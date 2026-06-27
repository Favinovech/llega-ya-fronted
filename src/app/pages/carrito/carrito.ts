import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { CarritoService, ItemCarrito } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { RegistroValidators, MENSAJES_ERROR, limits } from '../../validators';

@Component({
  selector: 'app-carrito',
  standalone: true,

  imports: [CommonModule, RouterModule, FormsModule, Navbar, Footer],
  templateUrl: './carrito.html',
  styleUrl:    './carrito.scss'
})
export class Carrito implements OnInit {
  private api = environment.apiUrl;

  items:       ItemCarrito[] = [];
  porNegocio:  Record<string, ItemCarrito[]> = {};
  direccion  = '';
  confirmando = false;
  errorMsg   = '';
  pedidoOk   = false;
  readonly limits = limits;
  constructor(
    public carritoSvc: CarritoService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Pre-llenar dirección con la del usuario si existe
    const usuario = this.auth.getUsuario();
    this.direccion = usuario?.direccion ?? '';

    this.carritoSvc.items$.subscribe(items => {
      this.items = items;
      this.porNegocio = this.carritoSvc.porNegocio;
    });
  }

  get negocioKeys(): string[] {
    return Object.keys(this.porNegocio);
  }

  nombreNegocio(key: string): string {
    return key.split('__')[1];
  }

  subtotalNegocio(items: ItemCarrito[]): number {
    return items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  }

  get totalGeneral(): number {
    return this.carritoSvc.total;
  }

  get totalItems(): number {
    return this.carritoSvc.totalItems;
  }

  actualizar(producto_id: number, event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value);
    this.carritoSvc.actualizarCantidad(producto_id, val);
  }

  eliminar(producto_id: number) {
    this.carritoSvc.eliminar(producto_id);
  }

  limpiarCarrito() {
    this.carritoSvc.limpiar();
  }

  confirmarPedido() {
    if (!this.direccion.trim()) {
      this.errorMsg = 'La dirección de entrega es obligatoria.';
      return;
    }
    if (this.items.length === 0) {
      this.errorMsg = 'Tu carrito está vacío.';
      return;
    }

    this.confirmando = true;
    this.errorMsg    = '';

    const payload = {
      direccion_entrega: this.direccion.trim(),
      items: this.items.map(i => ({
        producto_id: i.producto_id,
        cantidad:    i.cantidad
      }))
    };

    this.http.post<any>(`${this.api}/pedidos/crear/`, payload).subscribe({
      next: () => {
        this.confirmando = false;
        this.pedidoOk    = true;
        this.carritoSvc.limpiar();
        this.cdRef.markForCheck();
      },
      error: (err) => {
        this.confirmando = false;
        this.errorMsg = err.error?.error ?? 'Error al confirmar el pedido.';
        this.cdRef.markForCheck();
      }
    });
  }

  irAComercio() {
    this.router.navigate(['/comercios']);
  }

  irAPedidos() {
    this.router.navigate(['/pedidos']);
  }
}