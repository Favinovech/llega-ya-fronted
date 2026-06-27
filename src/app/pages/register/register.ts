import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RegistroValidators, MENSAJES_ERROR, limits } from '../../validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})

export class Register {
  readonly limits = limits;
  form!: FormGroup;
  errorMessage = '';
  exitoMessage = '';
  cargando = false;
  tipoSeleccionado: 'cliente' | 'repartidor' | '' = '';
  soloLetrasInput = RegistroValidators.soloLetrasInput;
  soloNumerosInput = RegistroValidators.soloNumerosInput;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    this.buildForm();
  }

  getError(campo: string): string {
    const control = this.form.get(campo);
    if (!control?.touched || !control.errors) return '';
    const errores = control.errors;
    const mensajes = MENSAJES_ERROR[campo] ?? {};
    const primerError = Object.keys(errores)[0];
    return mensajes[primerError] ?? 'Campo inválido.';
  }
  
  buildForm() {
    this.form = this.fb.group({
      nombre:   ['', [Validators.required, Validators.minLength(limits.nombre.min), Validators.maxLength(limits.nombre.max), RegistroValidators.soloLetras]],
      apellido: ['', [Validators.required, Validators.minLength(limits.apellido.min), Validators.maxLength(limits.apellido.max), RegistroValidators.soloLetras]],
      email:    ['', [Validators.required, Validators.email]],
      telefono: ['', [RegistroValidators.telefonoPeruano]],
      password: ['', [Validators.required, Validators.minLength(limits.password.min), Validators.maxLength(limits.password.max), RegistroValidators.contieneNumero]],
      dni:            ['', [RegistroValidators.dniPeruano]],
      vehiculo:       ['moto'],
      zona_cobertura: [''],
    });
  }

  seleccionarTipo(tipo: 'cliente' | 'repartidor') {
    this.tipoSeleccionado = tipo;
    this.errorMessage = '';
    this.exitoMessage = '';
    this.form.reset({ vehiculo: 'moto' });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Completa todos los campos obligatorios.';
      return;
    }

    this.cargando = true;
    this.errorMessage = '';

    if (this.tipoSeleccionado === 'repartidor') {
      const payload = {
        nombres:        this.form.value.nombre,
        apellidos:      this.form.value.apellido,
        email:          this.form.value.email,
        celular:        this.form.value.telefono || '',
        dni:            this.form.value.dni || '',
        vehiculo:       this.form.value.vehiculo,
        zona_cobertura: this.form.value.zona_cobertura || '',
        password:       this.form.value.password,
      };
      this.auth.registerRepartidor(payload).subscribe({
        next: () => {
          this.cargando = false;
          this.exitoMessage = 'Repartidor registrado correctamente';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err: any) => {
          this.cargando = false;
          this.errorMessage =
            err.error?.email?.[0] ?? err.error?.detail ?? 'Error al registrar. Intenta de nuevo.';
        }
      });
    } else {
      const payload = {
        nombre:     this.form.value.nombre,
        apellido:   this.form.value.apellido,
        email:      this.form.value.email,
        telefono:   this.form.value.telefono,
        password:   this.form.value.password,
        rol_nombre: 'cliente',
      };
      this.auth.register(payload).subscribe({
        next: () => {
          this.cargando = false;
          this.exitoMessage = '¡Cuenta creada! Redirigiendo al inicio de sesión...';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err: any) => {
          this.cargando = false;
          this.errorMessage = err.error?.email?.[0] ?? 'Error al registrar. Intenta de nuevo.';
        }
      });
    }
  }
}