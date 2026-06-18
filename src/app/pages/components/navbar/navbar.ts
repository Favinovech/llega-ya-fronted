import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NegocioService } from '../../../services/negocio.service';
import { CarritoService } from '../../../services/carrito.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  totalCarrito = 0;
  usuario: any = null;
  rol = '';
  tieneNegocio = false;

  constructor(
    private auth: AuthService,
    private negocioSvc: NegocioService,
    private carritoSvc: CarritoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuario = this.auth.getUsuario();
    this.rol     = this.auth.getRol();

    // Suscribirse a cambios en el carrito
    this.carritoSvc.items$.subscribe(items => {
      this.totalCarrito = this.carritoSvc.totalItems;
    });

    // Suscribirse a cambios (si registra un negocio, aparecen los botones al momento)
    this.negocioSvc.negocio$.subscribe(n => {
      this.tieneNegocio = n !== null;
    });

    // Cargar negocio si está logueado
    if (this.auth.isLoggedIn()) {
      this.negocioSvc.cargar().subscribe();
    }
  }

  logout() {
    this.negocioSvc.limpiar();
    this.auth.logout();
  }

  irAdmin()  { this.router.navigate(['/admin']);   }
  irPerfil() { this.router.navigate(['/profile']); }
}