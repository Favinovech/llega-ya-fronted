import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { ToastService } from '../../services/toast';
import { environment } from '../../../environments/environment';
import { RegistroValidators, MENSAJES_ERROR, limits } from '../../validators';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Navbar, Footer,],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private api = environment.apiUrl;
  readonly limits = limits;
  soloLetrasInput  = RegistroValidators.soloLetrasInput;
  soloNumerosInput = RegistroValidators.soloNumerosInput;

  usuario: any = null;
  seccionActiva = 'datos';
  editando = false;
  guardando = false;
  fotoUrl: string | null = null;
  subiendoFoto = false;

  editForm!: FormGroup;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.usuario = this.auth.getUsuario();
    this.initForm();
    this.cargarPerfil();
  }

  cargarFoto() {
    const foto = this.usuario?.foto;
    if (!foto) {
      this.fotoUrl = null;
      return;
    }
    this.fotoUrl = foto.startsWith('http') ? foto : foto;
  }

  initForm() {
    this.editForm = this.fb.group({
      nombre:   [this.usuario?.nombre   ?? '', [Validators.required, Validators.minLength(this.limits.nombre.min), Validators.maxLength(this.limits.nombre.max)]],
      apellido: [this.usuario?.apellido ?? '', [Validators.required, Validators.minLength(this.limits.apellido.min), Validators.maxLength(this.limits.apellido.max)]],
      telefono: [this.usuario?.telefono ?? '', [Validators.required, Validators.minLength(this.limits.telefono.min), Validators.maxLength(this.limits.telefono.max)]],
    });
  }

  getError(campo: string): string {
  const control = this.editForm.get(campo);
    if (!control?.touched || !control.errors) return '';
    const errores = control.errors;
    const mensajes = MENSAJES_ERROR[campo] ?? {};
    const primerError = Object.keys(errores)[0];
    return mensajes[primerError] ?? 'Campo inválido.';
  }

  cargarPerfil() {
    this.http.get<any>(`${this.api}/perfil/`).subscribe({
      next: (data) => {
        this.usuario = data;
        this.fotoUrl = data.foto ?? null;
        this.editForm.patchValue({
          nombre:   data.nombre,
          apellido: data.apellido,
          telefono: data.telefono,
        });
        this.cargarFoto();
        this.cdr.detectChanges();
      }
    });
  }

  get iniciales(): string {
    const n = this.usuario?.nombre?.[0] ?? '';
    const a = this.usuario?.apellido?.[0] ?? '';
    return (n + a).toUpperCase();
  }

  get rolLabel(): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      propietario: 'Propietario',
      repartidor: 'Repartidor',
      cliente: 'Cliente verificado',
    };
    return labels[this.usuario?.rol?.nombre ?? ''] ?? 'Cliente';
  }

  activar(seccion: string) {
    this.seccionActiva = seccion;
    this.editando = false;
  }

  iniciarEdicion() {
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
    this.editForm.patchValue({
      nombre:   this.usuario?.nombre,
      apellido: this.usuario?.apellido,
      telefono: this.usuario?.telefono,
    });
  }

  guardarPerfil() {
    if (this.editForm.invalid) return;
    this.guardando = true;

    this.http.put<any>(`${this.api}/perfil/`, this.editForm.value).subscribe({
      next: (data) => {
        this.guardando = false;
        this.editando = false;
        this.usuario = { ...this.usuario, ...data };
        // Actualizar localStorage
        localStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.toastService.mostrarExito('Perfil actualizado correctamente.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardando = false;
        this.toastService.mostrarError('Error al actualizar el perfil.');
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.auth.logout();
  }

  seleccionarFoto(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Vista previa inmediata
  const reader = new FileReader();
  reader.onload = (e) => this.fotoUrl = e.target?.result as string;
  reader.readAsDataURL(file);

  // Subir al backend
  this.subiendoFoto = true;
  const formData = new FormData();
  formData.append('foto', file);

  this.http.post<any>(`${this.api}/perfil/foto/`, formData).subscribe({
      next: (res) => {
        this.subiendoFoto = false;
        this.fotoUrl = res.foto;
        // Actualizar localStorage
        this.usuario = { ...this.usuario, foto: res.foto };
        localStorage.setItem('usuario', JSON.stringify(this.usuario));
      },
      error: () => this.subiendoFoto = false
    });
  }


}

