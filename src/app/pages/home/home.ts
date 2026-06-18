import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  usuario: any = null;
  terminoBusqueda = '';

  categorias = [
    {
      valor: 'restaurante', nombre: 'Restaurantes', descripcion: 'Menús del día y a la carta',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`
    },
    {
      valor: 'farmacia', nombre: 'Farmacias', descripcion: 'Medicamentos y salud',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2z"/><path d="M19 3H5a2 2 0 0 0-2 2v3h18V5a2 2 0 0 0-2-2z"/><path d="M2 12h20"/><path d="M12 12v9"/></svg>`
    },
    {
      valor: 'bodega', nombre: 'Bodegas', descripcion: 'Abarrotes y bebidas',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
    },
    {
      valor: 'mercado', nombre: 'Mercados', descripcion: 'Frutas, verduras y más',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`
    },
    {
      valor: 'postres', nombre: 'Postres', descripcion: 'Dulces y repostería',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/></svg>`
    },
  ];

  negociosDestacados = [
    {
      nombre: 'Pollería El Tizón',
      categoria: 'Restaurante',
      descripcion: 'Pollo a la brasa, anticuchos y parrillas desde 1995',
      tiempoEntrega: '25–35 min',
      calificacion: 4.8,
      etiqueta: 'Más pedido',
      colorFondo: '#fff3e0',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f57c00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
    },
    {
      nombre: 'Cevichería La Mar del Pueblo',
      categoria: 'Restaurante',
      descripcion: 'Ceviche clásico, tiradito y leche de tigre al instante',
      tiempoEntrega: '20–30 min',
      calificacion: 4.9,
      etiqueta: 'Top calidad',
      colorFondo: '#e3f2fd',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
    },
    {
      nombre: 'Farmacia Salud Total',
      categoria: 'Farmacia',
      descripcion: 'Medicamentos genéricos y de marca, entrega en minutos',
      tiempoEntrega: '15–25 min',
      calificacion: 4.7,
      etiqueta: null,
      colorFondo: '#e8f5e9',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2z"/><path d="M19 3H5a2 2 0 0 0-2 2v3h18V5a2 2 0 0 0-2-2z"/><path d="M2 12h20"/><path d="M12 12v9"/></svg>`,
    },
    {
      nombre: 'Bodega Don Pepe',
      categoria: 'Bodega',
      descripcion: 'Gaseosas, snacks, abarrotes y bebidas frías',
      tiempoEntrega: '10–20 min',
      calificacion: 4.6,
      etiqueta: 'Rápido',
      colorFondo: '#f3e5f5',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#7b1fa2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    },
    {
      nombre: 'Chifa Dragón de Oro',
      categoria: 'Restaurante',
      descripcion: 'Arroz chaufa, lomo saltado y wantán frito al wok',
      tiempoEntrega: '30–40 min',
      calificacion: 4.7,
      etiqueta: null,
      colorFondo: '#fce4ec',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c62828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    },
    {
      nombre: 'Pastelería Dulce Hogar',
      categoria: 'Postres',
      descripcion: 'Tortas artesanales, cupcakes y alfajores para cada ocasión',
      tiempoEntrega: '20–30 min',
      calificacion: 4.9,
      etiqueta: 'Nuevo',
      colorFondo: '#fffde7',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f9a825" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/></svg>`,
    },
  ];

  pasosServicio = [
    {
      numero: '01', titulo: 'Elige tu comercio', descripcion: 'Explora restaurantes, farmacias y bodegas verificados cerca de ti.',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`
    },
    {
      numero: '02', titulo: 'Arma tu pedido', descripcion: 'Selecciona los productos que quieres y agrégalos al carrito.',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`
    },
    {
      numero: '03', titulo: 'Confirma y paga', descripcion: 'Ingresa tu dirección y finaliza el pedido en segundos.',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    },
    {
      numero: '04', titulo: 'Recíbelo en casa', descripcion: 'Tu pedido llega directo a tu puerta en el menor tiempo posible.',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
    },
  ];

  estadisticas = [
    { valor: '500+', etiqueta: 'Comercios' },
    { valor: '15k+', etiqueta: 'Pedidos' },
    { valor: '98%',  etiqueta: 'Satisfacción' },
    { valor: '< 30 min', etiqueta: 'Entrega promedio' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.usuario = this.auth.getUsuario();
  }

  irAComercios(categoria?: string) {
    const extras = categoria ? { queryParams: { categoria } } : {};
    this.router.navigate(['/comercios'], extras);
  }

  buscar() {
    if (this.terminoBusqueda.trim()) {
      this.router.navigate(['/comercios'], { queryParams: { q: this.terminoBusqueda.trim() } });
    }
  }

  onBuscarKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.buscar();
  }

  get nombreUsuario(): string {
    return this.usuario?.nombre ?? 'por aquí';
  }
}
