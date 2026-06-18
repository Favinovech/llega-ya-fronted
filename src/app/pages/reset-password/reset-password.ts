import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

function passwordsCoinciden(control: AbstractControl): ValidationErrors | null {
  const pass    = control.get('password')?.value;
  const confirm = control.get('confirm')?.value;
  return pass === confirm ? null : { noCoincide: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword implements OnInit {
  form!: FormGroup;
  errorMessage  = '';
  tokenInvalido = false;
  exitoso       = false;
  cargando      = false;
  showPassword  = false;
  showConfirm   = false;

  private token = '';

  constructor(
    private fb:    FormBuilder,
    private route: ActivatedRoute,
    private auth:  AuthService,
    private cd:    ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.token) {
      this.tokenInvalido = true;
    }

    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirm:  ['', [Validators.required]]
    }, { validators: passwordsCoinciden });
  }

  cambiar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando     = true;
    this.errorMessage = '';

    const { password } = this.form.value;

    this.auth.confirmPasswordReset(this.token, password).subscribe({
      next: () => {
        this.cargando = false;
        this.exitoso  = true;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        const msg = err?.error?.error || '';

        if (msg.includes('expirado') || msg.includes('inválido')) {
          this.tokenInvalido = true;
        } else {
          this.errorMessage = msg || 'Ocurrió un error. Intenta de nuevo.';
        }
      }
    });
  }
}