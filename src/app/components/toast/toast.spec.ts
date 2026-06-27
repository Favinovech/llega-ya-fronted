import { TestBed } from '@angular/core/testing';
import { ToastService } from '../../services/toast';

describe('ToastService (component spec)', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });
});