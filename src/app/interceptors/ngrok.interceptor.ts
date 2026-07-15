// src/app/interceptors/ngrok.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const ngrokInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({
    setHeaders: { 'ngrok-skip-browser-warning': 'true' },
    withCredentials: true,   // para que viajen las cookies HttpOnly
  }));
};