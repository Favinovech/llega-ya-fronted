import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Estado compartido a nivel de modulo: garantiza UN SOLO refresh a la vez.
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

// Rutas que NO llevan el access token ni disparan el refresh.
const EXCLUDED = ['/login/', '/register/', '/token/refresh/', '/password-reset'];
const isExcluded = (url: string) => EXCLUDED.some(p => url.includes(p));

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // Siempre enviar la cookie; el access se pega solo si la ruta NO esta excluida.
  let authReq = req.clone({ withCredentials: true });
  if (token && !isExcluded(req.url)) {
    authReq = authReq.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isExcluded(req.url)) {
        return handle401(authReq, next, auth);
      }
      return throwError(() => error);
    })
  );
};

function handle401(req: HttpRequest<unknown>, next: HttpHandlerFn, auth: AuthService) {
  // Si el token en localStorage ya cambio respecto al que viajo en esta peticion,
  // un refresh paralelo ya termino: reintentar directo con el token nuevo (evita doble refresh).
  const sentToken = req.headers.get('Authorization')?.replace('Bearer ', '') ?? null;
  const storedToken = auth.getToken();
  if (sentToken !== null && storedToken !== null && storedToken !== sentToken && !isRefreshing) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${storedToken}` }, withCredentials: true }));
  }

  // Si YA hay un refresh en curso, esta peticion espera el token nuevo y reintenta.
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((t): t is string => t !== null),
      take(1),
      switchMap(newToken =>
        next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` }, withCredentials: true }))
      )
    );
  }

  // Soy la primera: bloqueo y hago el unico refresh.
  isRefreshing = true;
  refreshTokenSubject.next(null);

  return auth.refreshToken().pipe(
    switchMap(res => {
      isRefreshing = false;
      refreshTokenSubject.next(res.access);
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.access}` }, withCredentials: true }));
    }),
    catchError(err => {
      isRefreshing = false;
      refreshTokenSubject.next(null);
      auth.logout('/login');
      return throwError(() => err);
    })
  );
}
