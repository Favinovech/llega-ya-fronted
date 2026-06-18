import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { CarritoService } from '../../services/carrito.service';
import { environment } from '../../../environments/environment';

interface Negocio {
  id:          number;
  nombre:      string;
  descripcion: string;
  direccion:   string;
  categoria:   string;
  activo:      boolean;
  telefono:    string;
}

interface Producto {
  id:          number;
  negocio:     number;
  nombre:      string;
  descripcion: string;
  precio:      number;
  categoria:   string;
  disponible:  boolean;
}

@Component({
  selector: 'app-comercios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './comercios.html',
  styleUrl:    './comercios.scss'
})
export class Comercios implements OnInit {
  private api = environment.apiUrl;

  negocios:          Negocio[]  = [];
  negociosFiltrados: Negocio[]  = [];
  cargando =         true;

  // Negocio seleccionado y sus productos
  negocioActivo:  Negocio  | null = null;
  productos:      Producto[]      = [];
  cargandoProds = false;

  filtroTexto    = '';
  filtroCategoria = 'todos';

  categorias = [
    { valor: 'todos',       label: '🌟 Todos'        },
    { valor: 'restaurante', label: '🍴 Restaurantes'  },
    { valor: 'farmacia',    label: '💊 Farmacias'     },
    { valor: 'bodega',      label: '🏪 Bodegas'       },
    { valor: 'mercado',     label: '🛒 Mercados'      },
    { valor: 'postres',     label: '🍰 Postres'       },
    { valor: 'otro',        label: '📦 Otros'         },
  ];

  cantidadesSeleccionadas: Record<number, number> = {};

  constructor(
    private http: HttpClient,
    private carritoSvc: CarritoService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.http.get<Negocio[]>(`${this.api}/negocios/`).subscribe({
      next: (data) => {
        this.negocios = data;
        this.negociosFiltrados = data;

        // Leer query params del Home (categoria y búsqueda)
        const params = this.route.snapshot.queryParamMap;
        const cat = params.get('categoria');
        const q   = params.get('q');
        if (cat) this.filtroCategoria = cat;
        if (q)   this.filtroTexto     = q;

        this.aplicarFiltros();
        this.cargando = false;
        this.cdRef.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdRef.markForCheck();
      }
    });
  }

  // ── Filtros ───────────────────────────────────────
  onFiltroTexto(event: Event) {
    this.filtroTexto = (event.target as HTMLInputElement).value;
    this.aplicarFiltros();
  }

  onFiltroCategoria(cat: string) {
    this.filtroCategoria = cat;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let result = [...this.negocios];
    if (this.filtroTexto) {
      const txt = this.filtroTexto.toLowerCase();
      result = result.filter(n =>
        n.nombre.toLowerCase().includes(txt) ||
        n.descripcion?.toLowerCase().includes(txt)
      );
    }
    if (this.filtroCategoria !== 'todos') {
      result = result.filter(n => n.categoria === this.filtroCategoria);
    }
    this.negociosFiltrados = result;
  }

  // ── Seleccionar negocio ───────────────────────────
  seleccionarNegocio(n: Negocio) {
    this.negocioActivo = n;
    this.productos = [];
    this.cantidadesSeleccionadas = {};
    this.cargandoProds = true;
    this.cdRef.detectChanges();

    this.http.get<Producto[]>(`${this.api}/negocios/${n.id}/productos/`).subscribe({
      next: (data) => {
        this.productos = data;
        this.cargandoProds = false;
        // inicializar cantidades en 0
        data.forEach(p => this.cantidadesSeleccionadas[p.id] = 0);
        this.cdRef.markForCheck();
      },
      error: () => {
        this.cargandoProds = false;
        this.cdRef.markForCheck();
      }
    });
  }

  volverALista() {
    this.negocioActivo = null;
    this.productos = [];
  }

  // ── Carrito ───────────────────────────────────────
  incrementar(id: number) {
    this.cantidadesSeleccionadas[id] = (this.cantidadesSeleccionadas[id] ?? 0) + 1;
  }

  decrementar(id: number) {
    if ((this.cantidadesSeleccionadas[id] ?? 0) > 0) {
      this.cantidadesSeleccionadas[id]--;
    }
  }

  agregarAlCarrito(producto: Producto) {
    const cantidad = this.cantidadesSeleccionadas[producto.id] ?? 0;
    if (cantidad === 0) return;

    this.carritoSvc.agregar({
      producto_id:    producto.id,
      nombre:         producto.nombre,
      precio:         producto.precio,
      cantidad:       cantidad,
      negocio_id:     producto.negocio,
      negocio_nombre: this.negocioActivo!.nombre
    });

    this.cantidadesSeleccionadas[producto.id] = 0;
  }

  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }

  // ── Helpers ───────────────────────────────────────
  get totalItemsCarrito(): number {
    return this.carritoSvc.totalItems;
  }

  categoriaIcono(cat: string): string {
    const m: Record<string, string> = {
      restaurante: '🍴', farmacia: '💊', bodega: '🏪',
      mercado: '🛒', postres: '🍰', otro: '📦'
    };
    return m[cat] ?? '🏪';
  }
}