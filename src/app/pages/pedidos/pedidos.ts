import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { ToastService } from '../../services/toast';
import { PedidoService, Pedido } from '../../services/pedido.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Footer],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss'
})
export class Pedidos implements OnInit, OnDestroy {

  pedidos: Pedido[] = [];
  pedidoSeleccionado: Pedido | null = null;
  mostrarModalCancelacion = false;
  motivoCancelacion = '';
  cargando = true;
  filtroEstado: string = 'todos';
  private subs = new Subscription();

  // Para detectar cambios y disparar notificaciones (HU08 - criterio 2)
  private estadosPrevios = new Map<number, string>();

  // Para el mapa
  private map: any = null;
  private leafletCargado = false;

  // Pasos del flujo (HU08 - criterio 1)
  pasos = [
    { key: 'pendiente',  label: 'Pendiente',   icono: '📝' },
    { key: 'confirmado', label: 'Confirmado',  icono: '✅' },
    { key: 'en_camino',  label: 'En camino',   icono: '🛵' },
    { key: 'entregado',  label: 'Entregado',   icono: '📦' },
  ];

  constructor(
    private pedidoSvc: PedidoService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
  this.cargarLeaflet();

  this.pedidoSvc.iniciarPolling(10000);

  // Timeout de seguridad — si en 5s no cargó, quita el spinner igual
  setTimeout(() => {
    if (this.cargando) {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }, 5000);

    this.subs.add(
      this.pedidoSvc.pedidosStream.subscribe(pedidos => {
        this.detectarCambiosDeEstado(pedidos);
        this.pedidos = pedidos;
        this.cargando = false;

        if (this.pedidoSeleccionado) {
         const refrescado = pedidos.find(p => p.id === this.pedidoSeleccionado!.id);
          if (refrescado) {
            this.pedidoSeleccionado = refrescado;
            this.actualizarMapa();
          }
      }
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy() {
    this.pedidoSvc.detenerPolling();
    this.subs.unsubscribe();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  /** HU08 — Notificación cuando cambia el estado de algún pedido. */
  private detectarCambiosDeEstado(pedidosNuevos: Pedido[]) {
    if (this.estadosPrevios.size === 0) {
      // Primera carga: solo guardar, no notificar
      pedidosNuevos.forEach(p => this.estadosPrevios.set(p.id, p.estado));
      return;
    }
    pedidosNuevos.forEach(p => {
      const anterior = this.estadosPrevios.get(p.id);
      if (anterior && anterior !== p.estado) {
        const mensaje = `Pedido #${p.id}: ${this.labelEstado(anterior)} → ${p.estado_label}`;
        if (p.estado === 'entregado') {
          this.toast.mostrarExito(`🎉 ${mensaje}`);
        } else if (p.estado === 'cancelado') {
          this.toast.mostrarError(`❌ ${mensaje}`);
        } else {
          this.toast.mostrarInformacion(`🔔 ${mensaje}`);
        }
      }
      this.estadosPrevios.set(p.id, p.estado);
    });
  }

  labelEstado(estado: string): string {
    const mapa: any = {
      pendiente: 'Pendiente', confirmado: 'Confirmado',
      en_camino: 'En camino', entregado: 'Entregado',
      cancelado: 'Cancelado', completado: 'Completado'
    };
    return mapa[estado] ?? estado;
  }

  iconoEstado(estado: string): string {
    const mapa: any = {
      pendiente: '📝', confirmado: '✅',
      en_camino: '🛵', entregado: '📦',
      cancelado: '❌', completado: '🏁'
    };
    return mapa[estado] ?? '•';
  }

  get pedidosFiltrados(): Pedido[] {
    if (this.filtroEstado === 'todos') return this.pedidos;
    if (this.filtroEstado === 'activos') {
      return this.pedidos.filter(p => !['entregado', 'cancelado'].includes(p.estado));
    }
    return this.pedidos.filter(p => p.estado === this.filtroEstado);
  }

  /** Devuelve el índice del paso actual (0-3), o -1 si está cancelado. */
  pasoActual(pedido: Pedido): number {
    if (pedido.estado === 'cancelado') return -1;
    return this.pasos.findIndex(p => p.key === pedido.estado);
  }

  porcentajeProgreso(pedido: Pedido): number {
    const idx = this.pasoActual(pedido);
    if (idx < 0) return 0;
    return (idx / (this.pasos.length - 1)) * 100;
  }

  abrirDetalle(p: Pedido) {
    this.pedidoSeleccionado = p;
    setTimeout(() => this.actualizarMapa(), 50);
  }

  cerrarDetalle() {
    this.pedidoSeleccionado = null;
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  // Abre el modal de cancelación
abrirModalCancelacion(p: Pedido, event: Event) {
  event.stopPropagation();
  this.pedidoSeleccionado = p;
  this.motivoCancelacion  = '';
  this.mostrarModalCancelacion = true;
}

// Confirma la cancelación
confirmarCancelacion() {
  if (!this.pedidoSeleccionado) return;
  this.pedidoSvc.cancelarPedido(
    this.pedidoSeleccionado.id,
    this.motivoCancelacion.trim()
  ).subscribe({
    next: () => {
      this.toast.mostrarExito('Pedido cancelado correctamente.');
      this.mostrarModalCancelacion = false;
      this.pedidoSeleccionado = null;
      this.motivoCancelacion  = '';
    },
    error: (err: any) => {
      this.toast.mostrarError(err.error?.error ?? 'No se pudo cancelar.');
    }
  });
}

// Cierra el modal sin cancelar
cerrarModalCancelacion() {
  this.mostrarModalCancelacion = false;
  this.motivoCancelacion = '';
}

  // ═══════════════════════════════════
  // HU08 - Visualización en mapa (Leaflet)
  // ═══════════════════════════════════
  private cargarLeaflet() {
    if ((window as any).L) { this.leafletCargado = true; return; }
    // CSS
    if (!document.querySelector('link[data-leaflet]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.setAttribute('data-leaflet', 'true');
      document.head.appendChild(link);
    }
    // JS
    if (!document.querySelector('script[data-leaflet]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.setAttribute('data-leaflet', 'true');
      script.onload = () => { this.leafletCargado = true; };
      document.head.appendChild(script);
    }
  }

  private actualizarMapa() {
    if (!this.pedidoSeleccionado) return;
    const L = (window as any).L;
    if (!L) { setTimeout(() => this.actualizarMapa(), 300); return; }

    const p = this.pedidoSeleccionado;
    // Si el pedido no trae coords, usar default Lima centro
    const lat = Number(p.lat_entrega) || -12.0464;
    const lng = Number(p.lng_entrega) || -77.0428;

    const container = document.getElementById('mapa-pedido');
    if (!container) return;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.map = L.map('mapa-pedido').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(this.map);

    // Marcador destino
    const destino = L.marker([lat, lng]).addTo(this.map);
    destino.bindPopup(`<strong>📍 Entrega</strong><br>${p.direccion_entrega}`).openPopup();

    // Si el pedido está en camino, simular punto del repartidor cerca
    if (p.estado === 'en_camino') {
      const dx = (Math.random() - 0.5) * 0.01;
      const dy = (Math.random() - 0.5) * 0.01;
      const repartidor = L.marker([lat + dx, lng + dy], {
        icon: L.divIcon({
          html: '🛵', className: 'mapa-emoji', iconSize: [30, 30]
        })
      }).addTo(this.map);
      repartidor.bindPopup('Tu repartidor está en camino');

      // Línea entre los dos puntos
      L.polyline([[lat + dx, lng + dy], [lat, lng]], {
        color: '#6fb07f', weight: 3, dashArray: '8,8'
      }).addTo(this.map);
    }
  }
}