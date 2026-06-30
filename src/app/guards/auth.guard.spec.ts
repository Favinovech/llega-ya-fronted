import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authSpy: { isLoggedIn: ReturnType<typeof vi.fn> };
  let routerSpy: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authSpy   = { isLoggedIn: vi.fn() };
    routerSpy = { createUrlTree: vi.fn().mockReturnValue('/login') };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router,      useValue: routerSpy },
      ],
    });
  });

  it('devuelve true si el usuario está logueado', () => {
    authSpy.isLoggedIn.mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );
    expect(result).toBe(true);
  });

  it('redirige a /login si el usuario NO está logueado', () => {
    authSpy.isLoggedIn.mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe('/login');
  });
});

// Final archivo