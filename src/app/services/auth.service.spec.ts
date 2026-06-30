import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    service  = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // --- isLoggedIn ---
  it('isLoggedIn() devuelve false si no hay token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn() devuelve true si hay token en localStorage', () => {
    localStorage.setItem('access', 'token123');
    expect(service.isLoggedIn()).toBe(true);
  });

  // --- getToken ---
  it('getToken() retorna null si no hay token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('getToken() retorna el valor guardado', () => {
    localStorage.setItem('access', 'mi-token');
    expect(service.getToken()).toBe('mi-token');
  });

  // --- getUsuario ---
  it('getUsuario() retorna null si no hay usuario', () => {
    expect(service.getUsuario()).toBeNull();
  });

  it('getUsuario() parsea el JSON guardado', () => {
    const user = { id: 1, nombre: 'Ana', rol: 'cliente' };
    localStorage.setItem('usuario', JSON.stringify(user));
    expect(service.getUsuario()).toEqual(user);
  });

  // --- getRol ---
  it('getRol() retorna string vacío si no hay usuario', () => {
    expect(service.getRol()).toBe('');
  });

  it('getRol() retorna el rol del usuario', () => {
    localStorage.setItem('usuario', JSON.stringify({ rol: 'admin' }));
    expect(service.getRol()).toBe('admin');
  });

  // --- isAdmin ---
  it('isAdmin() retorna false si el rol no es admin', () => {
    localStorage.setItem('usuario', JSON.stringify({ rol: 'cliente' }));
    expect(service.isAdmin()).toBe(false);
  });

  it('isAdmin() retorna true si el rol es admin', () => {
    localStorage.setItem('usuario', JSON.stringify({ rol: 'admin' }));
    expect(service.isAdmin()).toBe(true);
  });

  // --- login ---
  it('login() guarda access y usuario en localStorage', () => {
    const respuesta = {
      access: 'nuevo-token',
      usuario: { id: 2, nombre: 'Juan', rol: 'cliente' },
    };

    service.login('juan@test.com', 'pass123').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/login/'));
    expect(req.request.method).toBe('POST');
    req.flush(respuesta);

    expect(localStorage.getItem('access')).toBe('nuevo-token');
    expect(JSON.parse(localStorage.getItem('usuario')!).nombre).toBe('Juan');
  });

  // --- register ---
  it('register() hace POST con los datos enviados', () => {
    const datos = { email: 'nuevo@test.com', password: 'pass', nombre: 'Test' };
    service.register(datos).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/register/'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ id: 1 });
  });

  // --- logout ---
  it('logout() limpia localStorage y navega al inicio', () => {
    localStorage.setItem('access', 'token-x');
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Ana' }));

    service.logout('/');

    const req = httpMock.expectOne(r => r.url.includes('/logout/'));
    req.flush({});

    expect(localStorage.getItem('access')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  // --- requestPasswordReset ---
  it('requestPasswordReset() hace POST con el email', () => {
    service.requestPasswordReset('user@test.com').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/password-reset-request/'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'user@test.com' });
    req.flush({});
  });

  // --- confirmPasswordReset ---
  it('confirmPasswordReset() hace POST con token y nueva contraseña', () => {
    service.confirmPasswordReset('abc123', 'NuevaClave1!').subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/password-reset-confirm/'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'abc123', new_password: 'NuevaClave1!' });
    req.flush({});
  });
});

// Final archivo