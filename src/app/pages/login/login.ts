import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  errorMessage = '';
  showPassword = false;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      remember: [false]
    });

    const savedEmail    = localStorage.getItem('saved_email');
    const savedPassword = localStorage.getItem('saved_password');
    if (savedEmail && savedPassword) {
      this.loginForm.patchValue({
        email: savedEmail, password: savedPassword, remember: true
      });
    }
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Completa todos los campos correctamente.';
      return;
    }

    const { email, password, remember } = this.loginForm.value;
    this.cargando = true;
    this.errorMessage = '';

    this.auth.login(email, password).subscribe({
      next: () => {
        this.cargando = false;

        if (remember) {
          localStorage.setItem('saved_email', email);
          localStorage.setItem('saved_password', password);
        } else {
          localStorage.removeItem('saved_email');
          localStorage.removeItem('saved_password');
        }

        const rol = this.auth.getRol();

        if (rol === 'admin') {
          this.router.navigate(['/admin']);
        } else if (rol === 'repartidor') {
          this.router.navigate(['/repartidor']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err: any) => {
        this.cargando = false;
        if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.';
        } else if (err.status === 400 || err.status === 401) {
          this.errorMessage = err.error?.detail ?? err.error?.error ?? 'Correo o contraseña incorrectos.';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado. Intenta de nuevo.';
        }
      }
    });
  }
}