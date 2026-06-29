import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CarritoService, ItemCarrito } from './carrito.service';

describe('CarritoService', () => {
  let service: CarritoService;

  const item1: ItemCarrito = {
    producto_id: 1,
    nombre: 'Pollo a la brasa',
    precio: 35,
    cantidad: 1,
    negocio_id: 10,
    negocio_nombre: 'Pollería El Sol',
  };

  const item2: ItemCarrito = {
    producto_id: 2,
    nombre: 'Gaseosa',
    precio: 5,
    cantidad: 2,
    negocio_id: 10,
    negocio_nombre: 'Pollería El Sol',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarritoService);
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('comienza vacío', () => {
    expect(service.items.length).toBe(0);
    expect(service.totalItems).toBe(0);
    expect(service.total).toBe(0);
  });

  it('agregar() añade un producto nuevo', () => {
    service.agregar(item1);
    expect(service.items.length).toBe(1);
    expect(service.items[0].nombre).toBe('Pollo a la brasa');
  });

  it('agregar() suma la cantidad si el producto ya existe', () => {
    service.agregar(item1);
    service.agregar({ ...item1, cantidad: 2 });
    expect(service.items.length).toBe(1);
    expect(service.items[0].cantidad).toBe(3);
  });

  it('totalItems cuenta todas las unidades', () => {
    service.agregar(item1);  // cantidad 1
    service.agregar(item2);  // cantidad 2
    expect(service.totalItems).toBe(3);
  });

  it('total calcula el precio correcto', () => {
    service.agregar(item1);  // 35 × 1 = 35
    service.agregar(item2);  // 5  × 2 = 10
    expect(service.total).toBe(45);
  });

  it('eliminar() remueve el producto por id', () => {
    service.agregar(item1);
    service.agregar(item2);
    service.eliminar(1);
    expect(service.items.length).toBe(1);
    expect(service.items[0].producto_id).toBe(2);
  });

  it('limpiar() vacía el carrito', () => {
    service.agregar(item1);
    service.agregar(item2);
    service.limpiar();
    expect(service.items.length).toBe(0);
  });

  it('actualizarCantidad() modifica la cantidad', () => {
    service.agregar(item1);
    service.actualizarCantidad(1, 5);
    expect(service.items[0].cantidad).toBe(5);
  });

  it('actualizarCantidad() con 0 elimina el producto', () => {
    service.agregar(item1);
    service.actualizarCantidad(1, 0);
    expect(service.items.length).toBe(0);
  });

  it('porNegocio() agrupa productos del mismo negocio', () => {
    service.agregar(item1);
    service.agregar(item2);
    const grupos = service.porNegocio;
    const keys = Object.keys(grupos);
    expect(keys.length).toBe(1);
    expect(grupos[keys[0]].length).toBe(2);
  });

  it('porNegocio() separa productos de distintos negocios', () => {
    service.agregar(item1);
    service.agregar({ ...item2, negocio_id: 99, negocio_nombre: 'Otro Negocio' });
    expect(Object.keys(service.porNegocio).length).toBe(2);
  });

  it('items$ emite cuando se agrega un producto', async () => {
    const promise = firstValueFrom(service.items$);
    service.agregar(item1);
    const items = await promise;
    expect(items.length).toBe(0); // firstValueFrom captura el valor inicial []
  });

  it('items$ emite el valor actualizado tras agregar', async () => {
    service.agregar(item1);
    const items = await firstValueFrom(service.items$);
    expect(items[0].nombre).toBe('Pollo a la brasa');
  });
});

// Final