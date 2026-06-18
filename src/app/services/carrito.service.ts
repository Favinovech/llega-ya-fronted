import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ItemCarrito {
  producto_id:    number;
  nombre:         string;
  precio:         number;
  cantidad:       number;
  negocio_id:     number;
  negocio_nombre: string;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {

  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  items$ = this.itemsSubject.asObservable();

  get items(): ItemCarrito[] {
    return this.itemsSubject.value;
  }

  get totalItems(): number {
    return this.items.reduce((acc, i) => acc + i.cantidad, 0);
  }

  get total(): number {
    return this.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  }

  // Agrupar por negocio para mostrar en el carrito
  get porNegocio(): Record<string, ItemCarrito[]> {
    const grupos: Record<string, ItemCarrito[]> = {};
    for (const item of this.items) {
      const key = `${item.negocio_id}__${item.negocio_nombre}`;
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(item);
    }
    return grupos;
  }

  agregar(item: ItemCarrito) {
    const actual = [...this.items];
    const idx = actual.findIndex(i => i.producto_id === item.producto_id);

    if (idx >= 0) {
      // Si ya existe, sumar cantidad
      actual[idx] = { ...actual[idx], cantidad: actual[idx].cantidad + item.cantidad };
    } else {
      actual.push(item);
    }
    this.itemsSubject.next(actual);
  }

  actualizarCantidad(producto_id: number, cantidad: number) {
    if (cantidad <= 0) {
      this.eliminar(producto_id);
      return;
    }
    const actual = this.items.map(i =>
      i.producto_id === producto_id ? { ...i, cantidad } : i
    );
    this.itemsSubject.next(actual);
  }

  eliminar(producto_id: number) {
    this.itemsSubject.next(this.items.filter(i => i.producto_id !== producto_id));
  }

  limpiar() {
    this.itemsSubject.next([]);
  }
}