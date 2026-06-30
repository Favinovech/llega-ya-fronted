import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { Login } from './login';
import { of, throwError } from 'rxjs';

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authSpy: {
    login:      ReturnType<typeof vi.fn>;
    getRol:     ReturnType<typeof vi.fn>;
    getToken:   ReturnType<typeof vi.fn>;
    getUsuario: ReturnType<typeof vi.fn>;
    isLoggedIn: ReturnType<typeof vi.fn>;
  };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authSpy = {
      login:      vi.fn(),
      getRol:     vi.fn().mockReturnValue('cliente'),
      getToken:   vi.fn().mockReturnValue(null),
      getUsuario: vi.fn().mockReturnValue(null),
      isLoggedIn: vi.fn().mockReturnValue(false),
    };

    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: Router,      useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {}, queryParams: {} },
            params:   of({}),
            queryParams: of({}),
          }
        },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario tiene los campos email, password y remember', () => {
    expect(component.loginForm.contains('email')).toBe(true);
    expect(component.loginForm.contains('password')).toBe(true);
    expect(component.loginForm.contains('remember')).toBe(true);
  });

  it('el formulario inicia inválido con campos vacíos', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('email inválido hace el formulario inválido', () => {
    component.loginForm.patchValue({ email: 'no-es-email', password: '1234' });
    expect(component.loginForm.valid).toBe(false);
  });

  it('formulario válido con email y password correctos', () => {
    component.loginForm.patchValue({ email: 'user@test.com', password: '1234' });
    expect(component.loginForm.valid).toBe(true);
  });

  it('password con menos de 4 caracteres hace el formulario inválido', () => {
    component.loginForm.patchValue({ email: 'user@test.com', password: '123' });
    expect(component.loginForm.valid).toBe(false);
  });

  it('login() con formulario inválido muestra mensaje de error', () => {
    component.loginForm.patchValue({ email: '', password: '' });
    component.login();
    expect(component.errorMessage).toBe('Completa todos los campos correctamente.');
  });

  it('login() con formulario inválido no llama a AuthService', () => {
    component.loginForm.patchValue({ email: '', password: '' });
    component.login();
    expect(authSpy.login).not.toHaveBeenCalled();
  });

  it('login() exitoso navega a /home para cliente', () => {
    authSpy.login.mockReturnValue(of({ access: 'token', usuario: {} }));
    authSpy.getRol.mockReturnValue('cliente');
    component.loginForm.patchValue({ email: 'user@test.com', password: '1234' });
    component.login();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('login() exitoso navega a /admin para admin', () => {
    authSpy.login.mockReturnValue(of({ access: 'token', usuario: {} }));
    authSpy.getRol.mockReturnValue('admin');
    component.loginForm.patchValue({ email: 'admin@test.com', password: '1234' });
    component.login();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('login() exitoso navega a /repartidor para repartidor', () => {
    authSpy.login.mockReturnValue(of({ access: 'token', usuario: {} }));
    authSpy.getRol.mockReturnValue('repartidor');
    component.loginForm.patchValue({ email: 'rep@test.com', password: '1234' });
    component.login();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/repartidor']);
  });

  it('login() con error 401 muestra mensaje de credenciales incorrectas', () => {
    authSpy.login.mockReturnValue(throwError(() => ({
      status: 401,
      error: { detail: 'Correo o contraseña incorrectos.' }
    })));
    component.loginForm.patchValue({ email: 'user@test.com', password: '1234' });
    component.login();
    expect(component.errorMessage).toBe('Correo o contraseña incorrectos.');
  });

  it('login() con error 0 muestra mensaje de sin conexión', () => {
    authSpy.login.mockReturnValue(throwError(() => ({ status: 0 })));
    component.loginForm.patchValue({ email: 'user@test.com', password: '1234' });
    component.login();
    expect(component.errorMessage).toContain('No se pudo conectar');
  });

  it('login() con remember guarda email y password en localStorage', () => {
    authSpy.login.mockReturnValue(of({ access: 'token', usuario: {} }));
    component.loginForm.patchValue({
      email: 'user@test.com', password: '1234', remember: true
    });
    component.login();
    expect(localStorage.getItem('saved_email')).toBe('user@test.com');
    expect(localStorage.getItem('saved_password')).toBe('1234');
  });

  it('login() sin remember elimina credenciales guardadas', () => {
    localStorage.setItem('saved_email', 'viejo@test.com');
    localStorage.setItem('saved_password', 'viejaclave');
    authSpy.login.mockReturnValue(of({ access: 'token', usuario: {} }));
    component.loginForm.patchValue({
      email: 'user@test.com', password: '1234', remember: false
    });
    component.login();
    expect(localStorage.getItem('saved_email')).toBeNull();
    expect(localStorage.getItem('saved_password')).toBeNull();
  });

  it('ngOnInit() precarga email y password si están en localStorage', () => {
    localStorage.setItem('saved_email', 'guardado@test.com');
    localStorage.setItem('saved_password', 'claveGuardada');
    component.ngOnInit();
    expect(component.loginForm.value.email).toBe('guardado@test.com');
    expect(component.loginForm.value.password).toBe('claveGuardada');
    expect(component.loginForm.value.remember).toBe(true);
  });
});

// Final archivo