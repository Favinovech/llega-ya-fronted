import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RepartidorService } from '../../services/repartidor.service';

@Component({
  selector: 'app-repartidor-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './repartidor-home.html',
  styleUrl: './repartidor-home.scss'
})
export class RepartidorHome implements OnInit {
  usuario: any = null;
  perfil: any  = null;

  disponible    = true;
  mostrarEditor = false;
  guardando     = false;
  errorMsg      = '';
  exitoMsg      = '';

  perfilForm!: FormGroup;

  get iniciales(): string {
    if (!this.usuario) return '?';
    return `${this.usuario.nombre?.[0] ?? ''}${this.usuario.apellido?.[0] ?? ''}`.toUpperCase();
  }

  get vehiculoLabel(): string {
    const map: Record<string, string> = {
      moto:      'Moto',
      bicicleta: 'Bicicleta',
      a_pie:     'A pie',
      auto:      'Auto',
    };
    return map[this.perfil?.vehiculo] ?? '-';
  }

  get zona(): string {
    return this.perfil?.zona_cobertura ?? '';
  }

  get totalPedidos(): number {
    return 0;
  }

  constructor(
    private auth: AuthService,
    private repartidorSvc: RepartidorService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuario = this.auth.getUsuario();
    this.perfilForm = this.fb.group({
      dni:            [''],
      vehiculo:       ['moto'],
      zona_cobertura: [''],
    });
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.repartidorSvc.getPerfil().subscribe({
      next: (data: any) => {
        this.perfil     = data;
        this.disponible = data.disponible ?? true;
        this.perfilForm.patchValue({
          dni:            data.dni,
          vehiculo:       data.vehiculo,
          zona_cobertura: data.zona_cobertura,
        });
      },
      error: () => {
        this.perfil = null;
      }
    });
  }

  toggleDisponibilidad() {
    this.disponible = !this.disponible;
    this.repartidorSvc.actualizarPerfil({ disponible: this.disponible }).subscribe();
  }

  guardarPerfil() {
    this.guardando = true;
    this.errorMsg  = '';
    this.exitoMsg  = '';

    this.repartidorSvc.actualizarPerfil(this.perfilForm.value).subscribe({
      next: (data: any) => {
        this.guardando     = false;
        this.perfil        = data;
        this.exitoMsg      = 'Perfil actualizado correctamente.';
        this.mostrarEditor = false;
        setTimeout(() => this.exitoMsg = '', 3000);
      },
      error: () => {
        this.guardando = false;
        this.errorMsg  = 'Error al guardar. Intenta de nuevo.';
      }
    });
  }

  salir() {
    this.auth.logout();
  }
}