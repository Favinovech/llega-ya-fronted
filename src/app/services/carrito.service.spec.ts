import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { CarritoService, ItemCarrito } from './carrito.service';

const ITEM_A: ItemCarrito = {
  producto_id: 1, nombre: 'Pollo a la brasa',
  precio: 35, cantidad: 1,
  negocio_id: 10, negocio_nombre: 'Pollería El Chino',
};
const ITEM_B: ItemCarrito = {
  producto_id: 2, nombre: 'Gaseosa 600ml',
  precio: 5, cantidad: 2,
  negocio_id: 10, negocio_nombre: 'Pollería El Chino',
};

describe('CarritoService – Pruebas Unitarias (HU07)', () => {
  let service: CarritoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarritoService);
    service.limpiar();
  });

  // ── Estado inicial ────────────────────────────────────────

  it('CP-PED-02 | carrito debe iniciar vacío', () => {
    expect(service.items.length).toBe(0);
    expect(service.total).toBe(0);
    expect(service.totalItems).toBe(0);
  });

  // ── agregar ───────────────────────────────────────────────

  it('CP-PED-01 | agregar() debe añadir producto nuevo al carrito', () => {
    service.agregar({ ...ITEM_A });
    expect(service.items.length).toBe(1);
    expect(service.items[0].nombre).toBe('Pollo a la brasa');
  });

  it('CP-PED-01 | agregar() el mismo producto dos veces debe sumar cantidad, no duplicar', () => {
    service.agregar({ ...ITEM_A, cantidad: 1 });
    service.agregar({ ...ITEM_A, cantidad: 2 });
    expect(service.items.length).toBe(1);
    expect(service.items[0].cantidad).toBe(3);
  });

  it('CP-PED-01 | agregar() dos productos distintos debe dejar 2 items', () => {
    service.agregar({ ...ITEM_A });
    service.agregar({ ...ITEM_B });
    expect(service.items.length).toBe(2);
  });

  // ── total ─────────────────────────────────────────────────

  it('CP-PED-03 | total debe calcularse correctamente (35×1 + 5×2 = 45)', () => {
    service.agregar({ ...ITEM_A });
    service.agregar({ ...ITEM_B });
    expect(service.total).toBe(45);
  });

  it('CP-PED-03 | total debe ser 0 con carrito vacío', () => {
    expect(service.total).toBe(0);
  });

  // ── totalItems ────────────────────────────────────────────

  it('CP-PED-03 | totalItems debe sumar todas las cantidades', () => {
    service.agregar({ ...ITEM_A, cantidad: 3 });
    service.agregar({ ...ITEM_B, cantidad: 2 });
    expect(service.totalItems).toBe(5);
  });

  // ── actualizarCantidad ────────────────────────────────────

  it('CP-PED-01 | actualizarCantidad() debe cambiar la cantidad del producto', () => {
    service.agregar({ ...ITEM_A });
    service.actualizarCantidad(ITEM_A.producto_id, 4);
    expect(service.items[0].cantidad).toBe(4);
  });

  it('CP-PED-02 | actualizarCantidad() con 0 debe eliminar el producto', () => {
    service.agregar({ ...ITEM_A });
    service.actualizarCantidad(ITEM_A.producto_id, 0);
    expect(service.items.length).toBe(0);
  });

  it('CP-PED-02 | actualizarCantidad() con negativo debe eliminar el producto', () => {
    service.agregar({ ...ITEM_A });
    service.actualizarCantidad(ITEM_A.producto_id, -1);
    expect(service.items.length).toBe(0);
  });

  // ── eliminar ──────────────────────────────────────────────

  it('CP-PED-01 | eliminar() debe quitar solo el producto indicado', () => {
    service.agregar({ ...ITEM_A });
    service.agregar({ ...ITEM_B });
    service.eliminar(ITEM_A.producto_id);
    expect(service.items.length).toBe(1);
    expect(service.items[0].producto_id).toBe(ITEM_B.producto_id);
  });

  // ── limpiar ───────────────────────────────────────────────

  it('CP-PED-02 | limpiar() debe vaciar completamente el carrito', () => {
    service.agregar({ ...ITEM_A });
    service.agregar({ ...ITEM_B });
    service.limpiar();
    expect(service.items.length).toBe(0);
    expect(service.total).toBe(0);
  });

  // ── porNegocio ────────────────────────────────────────────

  it('CP-PED-01 | porNegocio debe agrupar items del mismo negocio', () => {
    service.agregar({ ...ITEM_A });
    service.agregar({ ...ITEM_B });
    const grupos = service.porNegocio;
    const keys = Object.keys(grupos);
    expect(keys.length).toBe(1);
    expect(grupos[keys[0]].length).toBe(2);
  });
});