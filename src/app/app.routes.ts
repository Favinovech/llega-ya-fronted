import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { repartidorGuard } from './guards/repartidor.guard';
import { Landing } from './pages/landing/landing';
import { Home } from './pages/home/home';
import { Comercios } from './pages/comercios/comercios';
import { Carrito }   from './pages/carrito/carrito';
import { MiComercio } from './pages/mi-comercio/mi-comercio';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  // Pública
  { path: '', component: Landing },
  { path: 'login',    loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'forgot-password', loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword) },
  { path: 'reset-password',  loadComponent: () =>
      import('./pages/reset-password/reset-password').then(m => m.ResetPassword) },

  // Autenticadas (cliente/admin)
  { path: 'home',        component: Home,       canActivate: [authGuard] },
  { path: 'profile',     component: Profile,    canActivate: [authGuard] },
  { path: 'comercios',   component: Comercios,  canActivate: [authGuard] },
  { path: 'carrito',     component: Carrito,    canActivate: [authGuard] },
  { path: 'mi-comercio', component: MiComercio, canActivate: [authGuard] },
  { path: 'catalogo', canActivate: [authGuard],
    loadComponent: () => import('./pages/catalogo/catalogo').then(m => m.Catalogo) },
  { path: 'comercio/registro', canActivate: [authGuard],
    loadComponent: () => import('./pages/comercio-registro/comercio-registro').then(m => m.ComercioRegistro) },
  { path: 'pedidos', canActivate: [authGuard],
    loadComponent: () => import('./pages/mis-pedidos/mis-pedidos').then(m => m.MisPedidos) },

  // Solo admin
  { path: 'admin', canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin/admin').then(m => m.Admin) },

  // Solo repartidor
  { path: 'repartidor', canActivate: [repartidorGuard],
    loadComponent: () => import('./pages/repartidor-home/repartidor-home').then(m => m.RepartidorHome) },

  { path: '**', redirectTo: '' },
];