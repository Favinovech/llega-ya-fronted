import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.api}/login/`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('access', res.access);
        localStorage.setItem('refresh', res.refresh);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
      })
    );
  }

  register(data: any) {
    return this.http.post<any>(`${this.api}/register/`, data);
  }

  registerRepartidor(data: any) {
    return this.http.post<any>(`${this.api}/repartidor/register/`, data);
  }

  logout() {
    const refresh = localStorage.getItem('refresh');
    this.http.post(`${this.api}/logout/`, { refresh }).subscribe();
    localStorage.clear();
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('access');
  }

  getUsuario(): any {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  getRol(): string {
    return this.getUsuario()?.rol ?? '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getRol() === 'admin';
  }

  listarUsuarios() {
    return this.http.get<any[]>(`${this.api}/admin/usuarios/`);
  }

  cambiarRol(id: number, rol: string) {
    return this.http.put<any>(`${this.api}/admin/usuarios/${id}/rol/`, { rol });
  }

  cambiarEstado(id: number) {
    return this.http.put<any>(`${this.api}/admin/usuarios/${id}/estado/`, {});
  }
  
  requestPasswordReset(email: string) {
    return this.http.post<any>(`${this.api}/password-reset-request/`, { email });
  }

  confirmPasswordReset(token: string, newPassword: string) {
    return this.http.post<any>(`${this.api}/password-reset-confirm/`, {
      token,
      new_password: newPassword
    });
  }
}