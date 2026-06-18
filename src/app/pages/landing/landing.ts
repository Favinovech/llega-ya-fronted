import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {
  categorias = [
    {
      nombre: 'Restaurantes',
      descripcion: 'Menús del día, a la carta y pollerías',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
      </svg>`
    },
    {
      nombre: 'Farmacias',
      descripcion: 'Medicamentos genéricos y de marca',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2z"/><path d="M19 3H5a2 2 0 0 0-2 2v3h18V5a2 2 0 0 0-2-2z"/><path d="M2 12h20"/><path d="M12 12v9"/>
      </svg>`
    },
    {
      nombre: 'Bodegas',
      descripcion: 'Abarrotes, bebidas y snacks',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>`
    },
    {
      nombre: 'Mercados',
      descripcion: 'Frutas, verduras y productos frescos',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>`
    },
    {
      nombre: 'Postres',
      descripcion: 'Tortas, pasteles y dulces artesanales',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h0.01"/><path d="M12 4h0.01"/><path d="M17 4h0.01"/>
      </svg>`
    },
  ];

  pasos = [
    {
      num: '01',
      titulo: 'Elige tu comercio',
      descripcion: 'Explora restaurantes, farmacias y bodegas verificados cerca de ti.',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>`
    },
    {
      num: '02',
      titulo: 'Arma tu pedido',
      descripcion: 'Selecciona los productos y agrégalos al carrito en segundos.',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>`
    },
    {
      num: '03',
      titulo: 'Confirma tu dirección',
      descripcion: 'Ingresa tu dirección de entrega y finaliza el pedido.',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>`
    },
    {
      num: '04',
      titulo: 'Recíbelo en casa',
      descripcion: 'Tu pedido llega directo a tu puerta en minutos.',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>`
    },
  ];

  estadisticas = [
    { valor: '500+', label: 'Comercios registrados' },
    { valor: '15 000+', label: 'Pedidos completados' },
    { valor: '98%', label: 'Clientes satisfechos' },
    { valor: '< 30 min', label: 'Tiempo promedio' },
  ];

  year = new Date().getFullYear();
}
