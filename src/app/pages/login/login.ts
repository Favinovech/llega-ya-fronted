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
      next: (respuesta: any) => { // Agregamos 'respuesta' por si acaso
        this.cargando = false;
        if (remember) {
          localStorage.setItem('saved_email', email);
          localStorage.setItem('saved_password', password);
        } else {
          localStorage.removeItem('saved_email');
          localStorage.removeItem('saved_password');
        }

        // --- NUEVA LÓGICA DE REDIRECCIÓN INTELIGENTE ---
        // 1. Buscamos el token donde suele guardarse
        const token = localStorage.getItem('token') || localStorage.getItem('access_token') || (respuesta && respuesta.access);

        if (token) {
          try {
            // 2. Decodificamos el token (reemplazamos caracteres de Base64Url a Base64 estándar por seguridad)
            const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const payloadDecodificado = JSON.parse(atob(payloadBase64));

            // 3. Evaluamos el rol
            if (payloadDecodificado.rol === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/home']);
            }
          } catch (error) {
            console.error('Error al leer el token:', error);
            this.router.navigate(['/home']); // Fallback de seguridad
          }
        } else {
          this.router.navigate(['/home']); // Fallback si no encuentra el token
        }
        // -----------------------------------------------
      },
      error: () => {
        this.cargando = false;
        this.errorMessage = 'Correo o contraseña incorrectos.';
      }
    });
}
}