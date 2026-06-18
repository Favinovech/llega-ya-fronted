import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword implements OnInit {
  form!: FormGroup;
  errorMessage = '';
  enviado      = false;
  cargando     = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando     = true;
    this.errorMessage = '';

    const { email } = this.form.value;

    this.auth.requestPasswordReset(email).subscribe({
      next: () => {
        this.cargando = false;
        this.enviado  = true;
      },
      error: () => {
        this.cargando = false;
        this.enviado  = true; // Mostramos éxito igual por seguridad
      }
    });
  }
}