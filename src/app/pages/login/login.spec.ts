import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { Login } from './login';
import { AuthService } from '../../services/auth.service';

// ── Mock completo del AuthService ──────────────────────────────
const authMock = {
  login:      vi.fn(),
  getRol:     vi.fn(),
  isLoggedIn: vi.fn(),
};

describe('Login – Pruebas Unitarias (HU02)', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    vi.clearAllMocks(); // resetea los spies antes de cada prueba

    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Validaciones de formulario ─────────────────────────────

  it('CP-LOG-05 | formulario debe ser INVÁLIDO con ambos campos vacíos', () => {
    component.loginForm.setValue({ email: '', password: '', remember: false });
    expect(component.loginForm.invalid).toBe(true);
  });

  it('CP-LOG-05 | campo email vacío debe tener error "required"', () => {
    const ctrl = component.loginForm.get('email')!;
    ctrl.setValue('');
    ctrl.markAsTouched();
    expect(ctrl.hasError('required')).toBe(true);
  });

  it('CP-LOG-05 | email sin "@" debe tener error "email"', () => {
    const ctrl = component.loginForm.get('email')!;
    ctrl.setValue('correoSinArroba');
    expect(ctrl.hasError('email')).toBe(true);
  });

  it('CP-LOG-05 | password menor a 4 caracteres debe tener error "minlength"', () => {
    const ctrl = component.loginForm.get('password')!;
    ctrl.setValue('123');
    expect(ctrl.hasError('minlength')).toBe(true);
  });

  it('CP-LOG-01 | formulario debe ser VÁLIDO con email y password correctos', () => {
    component.loginForm.setValue({
      email: 'carlos@test.com',
      password: 'Test123',
      remember: false,
    });
    expect(component.loginForm.valid).toBe(true);
  });

  // ── Estado inicial ─────────────────────────────────────────

  it('CP-LOG-06 | showPassword debe empezar en false', () => {
    expect(component.showPassword).toBe(false);
  });

  it('CP-LOG-01 | errorMessage debe empezar vacío', () => {
    expect(component.errorMessage).toBe('');
  });

  it('CP-LOG-01 | cargando debe empezar en false', () => {
    expect(component.cargando).toBe(false);
  });

  // ── Llamadas al servicio ───────────────────────────────────

  it('CP-LOG-05 | login() NO debe llamar al servicio si el formulario es inválido', () => {
    component.loginForm.setValue({ email: '', password: '', remember: false });
    component.login();
    expect(authMock.login).not.toHaveBeenCalled();
  });

  it('CP-LOG-01 | login() debe llamar a auth.login() con email y password correctos', () => {
    authMock.login.mockReturnValue(of({ access: 'fake-token' }));
    authMock.getRol.mockReturnValue('cliente');

    component.loginForm.setValue({
      email: 'carlos@test.com',
      password: 'Test123',
      remember: false,
    });
    component.login();

    expect(authMock.login).toHaveBeenCalledWith('carlos@test.com', 'Test123');
  });

  it('CP-LOG-04 | login() fallido (401) debe poner mensaje de error y cargando=false', () => {
    authMock.login.mockReturnValue(
      throwError(() => ({
        status: 401,
        error: { detail: 'Correo o contraseña incorrectos.' },
      }))
    );

    component.loginForm.setValue({
      email: 'mal@test.com',
      password: 'wrong1',
      remember: false,
    });
    component.login();

    expect(component.errorMessage).toBe('Correo o contraseña incorrectos.');
    expect(component.cargando).toBe(false);
  });

  it('CP-LOG-04 | login() con servidor caído (status 0) debe mostrar error de conexión', () => {
    authMock.login.mockReturnValue(throwError(() => ({ status: 0 })));

    component.loginForm.setValue({
      email: 'carlos@test.com',
      password: 'Test123',
      remember: false,
    });
    component.login();

    expect(component.errorMessage).toContain('servidor');
  });
});