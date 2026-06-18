import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
  usuarios: any[] = [];
  cargando = true;
  error = '';
  mensaje = '';
  roles = ['admin', 'cliente', 'repartidor'];

  constructor(private auth: AuthService, private cdr: ChangeDetectorRef, private toastService: ToastService) {}

  ngOnInit() { this.cargarUsuarios(); }

  cargarUsuarios() {
    this.cargando = true;
    this.auth.listarUsuarios().subscribe({
      next: (data) => { this.usuarios = data; this.cargando = false; this.cdr.detectChanges();},
      error: () => { this.error = 'Error al cargar usuarios.'; this.cargando = false; this.cdr.detectChanges();}
    });
  }

  cambiarRol(usuario: any, event: Event) {
    const nuevoRol = (event.target as HTMLSelectElement).value;
    this.auth.cambiarRol(usuario.id, nuevoRol).subscribe({
      next: () => {
        this.toastService.mostrarExito(`Rol de ${usuario.nombre} actualizado a "${nuevoRol}"`);
        if (usuario.rol && usuario.rol.nombre) {
            usuario.rol.nombre = nuevoRol;
        } else { usuario.rol = nuevoRol;}
        this.cdr.detectChanges();
        
        setTimeout(() => { this.toastService.mostrarExito('Rol actualizado correctamente.'); this.cdr.detectChanges();}, 3000);
      },
      error: () => { 
        this.toastService.mostrarError('Error al cambiar el rol.');
        this.cdr.detectChanges();}
    });
  }

  cambiarEstado(usuario: any) {
    this.auth.cambiarEstado(usuario.id).subscribe({
      next: (res) => {
        usuario.activo = !usuario.activo;
        this.toastService.mostrarExito(`✅ ${res.mensaje}`);
        this.cdr.detectChanges();
        
        //setTimeout(() => {this.toastService.mostrarExito(''); this.cdr.detectChanges(); }, 3000);
      },
      
      error: () => {
        this.toastService.mostrarError('❌ Error al comunicarse con la base de datos.');
        this.cdr.detectChanges();
        
        setTimeout(() => {this.toastService.mostrarError(''); this.cdr.detectChanges(); }, 3000);}
    });
  }

}