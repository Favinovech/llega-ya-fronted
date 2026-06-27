import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ToastService, ToastMessage } from './toast';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('mostrarExito() emite mensaje con tipo success', async () => {
    const promise = firstValueFrom(service.toastAccion);
    service.mostrarExito('Operación exitosa');
    const msg = await promise;
    expect(msg.texto).toBe('Operación exitosa');
    expect(msg.tipo).toBe('success');
  });

  it('mostrarError() emite mensaje con tipo error', async () => {
    const promise = firstValueFrom(service.toastAccion);
    service.mostrarError('Algo falló');
    const msg = await promise;
    expect(msg.texto).toBe('Algo falló');
    expect(msg.tipo).toBe('error');
  });

  it('mostrarInformacion() emite mensaje con tipo info', async () => {
    const promise = firstValueFrom(service.toastAccion);
    service.mostrarInformacion('Ten en cuenta esto');
    const msg = await promise;
    expect(msg.texto).toBe('Ten en cuenta esto');
    expect(msg.tipo).toBe('info');
  });
});