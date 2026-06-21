import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const repartidorGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.getRol() === 'repartidor') {
    return true;
  }

  if (auth.isLoggedIn()) {
    router.navigate(['/home']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};