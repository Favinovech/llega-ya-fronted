import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { ToastService } from '../../services/toast';
import { environment } from '../../../environments/environment';

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
  detalles: DetallePedido[];
  motivo_cancelacion?: string | null;
}

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Navbar, Footer],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.scss'
})
export class MisPedidos implements OnInit {
  private api = environment.apiUrl;
  pedidos: Pedido[] = [];
  cargando  = true;
  errorMsg  = '';

  // Modal cancelación
  mostrarModal       = false;
  pedidoAcancelar: Pedido | null = null;
  motivoCancelacion  = '';

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  this.cargarPedidos();

  // Timeout de seguridad — si en 8s no cargó, quita el spinner
  setTimeout(() => {
    if (this.cargando) {
      this.cargando = false;
      this.errorMsg = 'La carga tardó demasiado. Intenta recargar.';
    }
  }, 8000);
}

  cargarPedidos() {
  this.cargando = true;
  this.errorMsg = '';
  this.http.get<Pedido[]>(`${this.api}/pedidos/`).subscribe({
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

  // Abre el modal
  abrirModalCancelacion(pedido: Pedido) {
    this.pedidoAcancelar    = pedido;
    this.motivoCancelacion  = '';
    this.mostrarModal       = true;
  }

  // Cierra el modal
  cerrarModal() {
    this.mostrarModal      = false;
    this.cdr.detectChanges();
  }

  // Confirma la cancelación
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

  etiquetaEstado(estado: string): string {
    const mapa: Record<string, string> = {
      pendiente:  'Pendiente',
      confirmado: 'Confirmado',
      en_camino:  'En camino',
      entregado:  'Entregado',
      cancelado:  'Cancelado',
      completado: 'Completado'  // ← nuevo
    };
    return mapa[estado] ?? estado;
  }

  claseEstado(estado: string): string {
    return `estado-${estado}`;
  }
}