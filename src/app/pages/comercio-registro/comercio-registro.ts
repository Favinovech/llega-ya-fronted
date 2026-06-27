import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Navbar } from '../components/navbar/navbar';
import { NegocioService } from '../../services/negocio.service';
import { environment } from '../../../environments/environment';
import { RegistroValidators, MENSAJES_ERROR, limits } from '../../validators';

@Component({
  selector: 'app-comercio-registro',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Navbar],
  templateUrl: './comercio-registro.html',
  styleUrl: './comercio-registro.scss'
})
export class ComercioRegistro implements OnInit {
  private api = environment.apiUrl;
  readonly limits = limits;
  soloLetrasInput  = RegistroValidators.soloLetrasInput;
  soloNumerosInput = RegistroValidators.soloNumerosInput; 
  pasoActual = 1;
  totalPasos = 3;
  guardando  = false;
  errorMsg   = '';

  // Logo preview
  logoPreview: string | null = null;
  logoFile:    File | null   = null;

  getError(form: FormGroup, campo: string): string {
    const control = form.get(campo);
    if (!control?.touched || !control.errors) return '';
    const errores = control.errors;
    const mensajes = MENSAJES_ERROR[campo] ?? {};
    const primerError = Object.keys(errores)[0];
    return mensajes[primerError] ?? 'Campo inválido.';
  }

  get errorHoraCierre(): string {
    if (!this.paso3.errors?.['horaCierreInvalida']) return '';
    return MENSAJES_ERROR['hora_cierre']['horaCierreInvalida'];
  }

  rubros = [
    { valor: 'restaurante', icono: '🍴', label: 'Restaurante' },
    { valor: 'farmacia',    icono: '💊', label: 'Farmacia'    },
    { valor: 'bodega',      icono: '🏪', label: 'Bodega'      },
    { valor: 'mercado',     icono: '🛒', label: 'Mercado'     },
    { valor: 'postres',     icono: '🍰', label: 'Postres'     },
    { valor: 'otro',        icono: '📦', label: 'Otro'        },
  ];

  dias = [
    { key: 'lunes',     label: 'Lun' },
    { key: 'martes',    label: 'Mar' },
    { key: 'miercoles', label: 'Mié' },
    { key: 'jueves',    label: 'Jue' },
    { key: 'viernes',   label: 'Vie' },
    { key: 'sabado',    label: 'Sáb' },
    { key: 'domingo',   label: 'Dom' },
  ];

  diasSeleccionados: Set<string> = new Set(['lunes','martes','miercoles','jueves','viernes']);

  // Paso 1
  paso1!: FormGroup;
  // Paso 2
  paso2!: FormGroup;
  // Paso 3
  paso3!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private negocioSvc: NegocioService
  ) {}

  ngOnInit() {
    this.paso1 = this.fb.group({
      ruc:          ['', [Validators.required, RegistroValidators.rucPeruano, Validators.maxLength(limits.ruc.max)]],
      razon_social: ['', [Validators.required, Validators.maxLength(limits.razon_social.max)]],
      nombre:       ['', [Validators.required, Validators.minLength(limits.nombre_comercial.min), Validators.maxLength(limits.nombre_comercial.max)]],
    });

    this.paso2 = this.fb.group({
      categoria:   ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(limits.descripcion.max)]],
      telefono:    ['', [Validators.required, RegistroValidators.telefonoPeruano, Validators.maxLength(limits.telefono.max)]],
    });

    this.paso3 = this.fb.group({
      direccion:     ['', Validators.required, Validators.maxLength(limits.direccion.max)],
      hora_apertura: ['08:00', Validators.required],
      hora_cierre:   ['22:00', Validators.required],
    }, { validators: RegistroValidators.horaCierreValida });
  }

  // ── Navegación wizard ──────────────────────────────

  get pasoActualForm(): FormGroup {
    return [this.paso1, this.paso2, this.paso3][this.pasoActual - 1];
  }

  siguiente() {
    if (this.pasoActualForm.invalid) {
      this.pasoActualForm.markAllAsTouched();
      return;
    }
    if (this.pasoActual < this.totalPasos) this.pasoActual++;
  }

  anterior() {
    if (this.pasoActual > 1) this.pasoActual--;
  }

  irAPaso(n: number) {
    // Solo permite ir a pasos ya completados
    if (n < this.pasoActual) this.pasoActual = n;
  }

  // ── Rubro ──────────────────────────────────────────

  seleccionarRubro(valor: string) {
    this.paso2.patchValue({ categoria: valor });
  }

  // ── Días ───────────────────────────────────────────

  toggleDia(dia: string) {
    if (this.diasSeleccionados.has(dia)) {
      this.diasSeleccionados.delete(dia);
    } else {
      this.diasSeleccionados.add(dia);
    }
  }

  // ── Logo ───────────────────────────────────────────

  onLogoSeleccionado(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.logoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => this.logoPreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  // ── Submit ─────────────────────────────────────────

  registrar() {
    if (this.paso3.invalid) {
      this.paso3.markAllAsTouched();
      return;
    }
    if (this.diasSeleccionados.size === 0) {
      this.errorMsg = 'Selecciona al menos un día de atención.';
      return;
    }

    this.guardando = true;
    this.errorMsg  = '';

    const payload = {
      ...this.paso1.value,
      ...this.paso2.value,
      ...this.paso3.value,
      dias_atencion: Array.from(this.diasSeleccionados),
    };

    this.http.post<any>(`${this.api}/negocio/`, payload).subscribe({
      next: () => {
        this.guardando = false;
        this.negocioSvc.refrescar();
        this.router.navigate(['/mi-comercio'], { queryParams: { comercio: 'registrado' } });
      },
      error: (err) => {
        this.guardando = false;
        this.errorMsg = err.error?.detail ?? err.error?.nombre?.[0] ?? 'Error al registrar.';
      }
    });
  }

  // ── Helpers ────────────────────────────────────────

  get porcentaje(): number {
    return ((this.pasoActual - 1) / (this.totalPasos - 1)) * 100;
  }

  campo(form: FormGroup, field: string) {
    return form.get(field);
  }

  invalido(form: FormGroup, field: string): boolean {
    const c = this.campo(form, field);
    return !!(c?.invalid && c?.touched);
  }
}