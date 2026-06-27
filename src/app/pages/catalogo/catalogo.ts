import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { ToastService } from '../../services/toast';
import { ProductoService, Producto, HistorialCambio } from '../../services/producto.service';
import { RegistroValidators, MENSAJES_ERROR, limits } from '../../validators';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Footer],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss'
})
export class Catalogo implements OnInit {

  productos: Producto[] = [];
  cargando = false;
  readonly limits = limits;
  soloDecimalesInput = RegistroValidators.soloDecimalesInput;
  limitarPrecio = RegistroValidators.limitarPrecio;
  // Filtros
  filtroTexto = '';
  filtroCategoria = '';
  filtroDisponibilidad: 'todos' | 'disponibles' | 'no_disponibles' = 'todos';

  // Edición inline de precio
  editandoPrecioId: number | null = null;
  precioTemporal: string = '';

  categorias = [
    { value: 'comida',    label: 'Comida' },
    { value: 'bebida',    label: 'Bebida' },
    { value: 'postre',    label: 'Postre' },
    { value: 'snack',     label: 'Snack' },
    { value: 'medicina',  label: 'Medicina' },
    { value: 'higiene',   label: 'Higiene' },
    { value: 'abarrotes', label: 'Abarrotes' },
    { value: 'otro',      label: 'Otro' },
  ];

  // Modal crear/editar
  mostrarModalProducto = false;
  productoEnEdicion: Partial<Producto> = this.crearProductoVacio();
  guardandoProducto = false;
  errorFormulario = '';

  // Modal historial
  mostrarModalHistorial = false;
  historialActual: HistorialCambio[] = [];
  productoHistorial: Producto | null = null;
  cargandoHistorial = false;
  filtroHistorialTipo = '';

  // Modal eliminar
  mostrarConfirmEliminar = false;
  productoAEliminar: Producto | null = null;

  constructor(
    private productoService: ProductoService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando = true;
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.toast.mostrarError('No se pudieron cargar los productos. ¿Tienes un negocio registrado?');
        this.cdr.detectChanges();
      }
    });
  }

  get productosFiltrados(): Producto[] {
    const texto = this.filtroTexto.trim().toLowerCase();
    return this.productos.filter(p => {
      const coincideTexto = !texto
        || p.nombre.toLowerCase().includes(texto)
        || (p.descripcion ?? '').toLowerCase().includes(texto);
      const coincideCat = !this.filtroCategoria || p.categoria === this.filtroCategoria;
      const coincideDisp =
        this.filtroDisponibilidad === 'todos'
        || (this.filtroDisponibilidad === 'disponibles' && p.disponible)
        || (this.filtroDisponibilidad === 'no_disponibles' && !p.disponible);
      return coincideTexto && coincideCat && coincideDisp;
    });
  }

  limpiarFiltros() {
    this.filtroTexto = '';
    this.filtroCategoria = '';
    this.filtroDisponibilidad = 'todos';
  }

  // HU06: edición inline de precio
  iniciarEdicionPrecio(p: Producto) {
    this.editandoPrecioId = p.id!;
    this.precioTemporal = String(p.precio);
  }
  cancelarEdicionPrecio() {
    this.editandoPrecioId = null;
    this.precioTemporal = '';
  }
  guardarPrecio(p: Producto) {
    const nuevo = parseFloat(this.precioTemporal);
    if (isNaN(nuevo) || nuevo <= 0) {
      this.toast.mostrarError('Ingresa un precio válido mayor a 0.');
      return;
    }
    if (nuevo === Number(p.precio)) { this.cancelarEdicionPrecio(); return; }
    this.productoService.cambiarPrecio(p.id!, nuevo).subscribe({
      next: (res) => {
        p.precio = res.producto.precio;
        p.updated_at = res.producto.updated_at;
        this.cancelarEdicionPrecio();
        this.toast.mostrarExito(res.mensaje ?? 'Precio actualizado.');
        this.cdr.detectChanges();
      },
      error: (err) => this.toast.mostrarError(err.error?.error ?? 'No se pudo actualizar el precio.')
    });
  }

  toggleDisponibilidad(p: Producto) {
    this.productoService.toggleDisponibilidad(p.id!).subscribe({
      next: (res) => {
        p.disponible = res.producto.disponible;
        p.updated_at = res.producto.updated_at;
        this.toast.mostrarExito(res.mensaje);
        this.cdr.detectChanges();
      },
      error: () => this.toast.mostrarError('No se pudo cambiar la disponibilidad.')
    });
  }

  abrirModalCrear() {
    this.productoEnEdicion = this.crearProductoVacio();
    this.errorFormulario = '';
    this.mostrarModalProducto = true;
  }
  abrirModalEditar(p: Producto) {
    this.productoEnEdicion = { ...p };
    this.errorFormulario = '';
    this.mostrarModalProducto = true;
  }
  cerrarModalProducto() {
    this.mostrarModalProducto = false;
    this.productoEnEdicion = this.crearProductoVacio();
    this.errorFormulario = '';
  }
  guardarProducto() {
    const p = this.productoEnEdicion;
    if (!p.nombre || !String(p.nombre).trim()) { this.errorFormulario = 'El nombre es obligatorio.'; return; }
    if (p.precio === undefined || p.precio === null || Number(p.precio) <= 0) { this.errorFormulario = 'El precio debe ser mayor a 0.'; return; }
    if (!p.categoria) { this.errorFormulario = 'Selecciona una categoría.'; return; }

    this.guardandoProducto = true;
    this.errorFormulario = '';

    const payload: Partial<Producto> = {
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      precio: Number(p.precio),
      categoria: p.categoria,
      disponible: p.disponible ?? true,
    };
    const obs = p.id
      ? this.productoService.actualizar(p.id, payload)
      : this.productoService.crear(payload);

    obs.subscribe({
      next: () => {
        const nombre = p.nombre;
        const esEdicion = !!p.id;
        this.guardandoProducto = false;
        this.cerrarModalProducto();
        this.cargarProductos();
        this.toast.mostrarExito(p.id ? `Producto "${nombre}" actualizado.` : `Producto "${nombre}" creado.`);
      },
      error: (err) => {
        this.guardandoProducto = false;
        this.errorFormulario =
          err.error?.error ?? err.error?.nombre?.[0] ?? err.error?.precio?.[0]
          ?? 'No se pudo guardar el producto.';
        this.cdr.detectChanges();
      }
    });
  }

  // HU06: historial
  abrirHistorial(p: Producto) {
    this.productoHistorial = p;
    this.historialActual = [];
    this.cargandoHistorial = true;
    this.mostrarModalHistorial = true;
    this.filtroHistorialTipo = '';
    this.productoService.historialDeProducto(p.id!).subscribe({
      next: (data) => {
        this.historialActual = data;
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoHistorial = false;
        this.toast.mostrarError('No se pudo cargar el historial.');
        this.cdr.detectChanges();
      }
    });
  }
  cerrarHistorial() {
    this.mostrarModalHistorial = false;
    this.productoHistorial = null;
    this.historialActual = [];
  }
  get historialFiltrado(): HistorialCambio[] {
    if (!this.filtroHistorialTipo) return this.historialActual;
    return this.historialActual.filter(h => h.tipo_cambio === this.filtroHistorialTipo);
  }

  // Eliminar
  pedirConfirmEliminar(p: Producto) {
    this.productoAEliminar = p;
    this.mostrarConfirmEliminar = true;
  }
  cancelarEliminar() {
    this.productoAEliminar = null;
    this.mostrarConfirmEliminar = false;
  }
  confirmarEliminar() {
    if (!this.productoAEliminar) return;
    const id = this.productoAEliminar.id!;
    this.productoService.eliminar(id).subscribe({
      next: () => {
        const nombreEliminado = this.productoAEliminar!.nombre;
        this.productos = this.productos.filter(x => x.id !== id);
        this.cancelarEliminar();
        this.toast.mostrarExito(`Producto "${nombreEliminado}" eliminado.`);
        this.cdr.detectChanges();
      },
      error: () => this.toast.mostrarError('No se pudo eliminar el producto.')
    });
  }

  private crearProductoVacio(): Partial<Producto> {
    return { nombre: '', descripcion: '', precio: 0, categoria: 'otro', disponible: true };
  }

  iconoTipoCambio(tipo: string): string {
    switch (tipo) {
      case 'creacion':    return '✨';
      case 'precio':      return '💰';
      case 'disponible':  return '🔁';
      case 'nombre':      return '✏️';
      case 'descripcion': return '📝';
      case 'categoria':   return '🏷️';
      case 'eliminacion': return '🗑️';
      default:            return '•';
    }
  }

  get totalDisponibles(): number { return this.productos.filter(p => p.disponible).length; }
  get totalNoDisponibles(): number { return this.productos.filter(p => !p.disponible).length; }
}