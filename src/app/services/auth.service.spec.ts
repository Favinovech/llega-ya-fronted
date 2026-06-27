import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { AuthService } from './auth.service';

describe('AuthService – Pruebas Unitarias (HU02 / HU03)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── isLoggedIn ────────────────────────────────────────────

  it('HU02 | isLoggedIn() debe retornar false sin token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('HU02 | isLoggedIn() debe retornar true si hay token en localStorage', () => {
    localStorage.setItem('access', 'fake-token-123');
    expect(service.isLoggedIn()).toBe(true);
  });

  // ── getRol ────────────────────────────────────────────────

  it('HU02 | getRol() debe retornar "cliente" según localStorage', () => {
    localStorage.setItem('usuario', JSON.stringify({ rol: 'cliente' }));
    expect(service.getRol()).toBe('cliente');
  });

  it('HU02 | getRol() debe retornar "admin" según localStorage', () => {
    localStorage.setItem('usuario', JSON.stringify({ rol: 'admin' }));
    expect(service.getRol()).toBe('admin');
  });

  it('HU02 | getRol() debe retornar "repartidor" según localStorage', () => {
    localStorage.setItem('usuario', JSON.stringify({ rol: 'repartidor' }));
    expect(service.getRol()).toBe('repartidor');
  });

  it('HU02 | getRol() debe retornar cadena vacía si no hay usuario', () => {
    expect(service.getRol()).toBe('');
  });

  // ── isAdmin ───────────────────────────────────────────────

  it('HU02 | isAdmin() debe retornar true solo con rol "admin"', () => {
    localStorage.setItem('usuario', JSON.stringify({ rol: 'admin' }));
    expect(service.isAdmin()).toBe(true);
  });

  it('HU02 | isAdmin() debe retornar false con rol "cliente"', () => {
    localStorage.setItem('usuario', JSON.stringify({ rol: 'cliente' }));
    expect(service.isAdmin()).toBe(false);
  });

  // ── getUsuario ────────────────────────────────────────────

  it('HU03 | getUsuario() debe retornar null si localStorage está vacío', () => {
    expect(service.getUsuario()).toBeNull();
  });

  it('HU03 | getUsuario() debe retornar el objeto guardado correctamente', () => {
    const usuario = { id: 1, nombre: 'Carlos', email: 'carlos@test.com', rol: 'cliente' };
    localStorage.setItem('usuario', JSON.stringify(usuario));
    expect(service.getUsuario()).toEqual(usuario);
  });

  // ── getToken ──────────────────────────────────────────────

  it('HU02 | getToken() debe retornar el token guardado', () => {
    localStorage.setItem('access', 'mi-token-xyz');
    expect(service.getToken()).toBe('mi-token-xyz');
  });

  it('HU02 | getToken() debe retornar null si no hay token', () => {
    expect(service.getToken()).toBeNull();
  });

  // ── logout ────────────────────────────────────────────────

  it('HU02 | logout() debe eliminar access y usuario de localStorage', () => {
    localStorage.setItem('access', 'fake-token');
    localStorage.setItem('usuario', JSON.stringify({ rol: 'cliente' }));

    service.logout();

    const req = httpMock.expectOne(r => r.url.includes('/logout/'));
    req.flush({});

    expect(localStorage.getItem('access')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });
});