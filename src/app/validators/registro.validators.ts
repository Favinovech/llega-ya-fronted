import { AbstractControl, ValidationErrors } from '@angular/forms';

export class RegistroValidators {

  static soloLetras(control: AbstractControl): ValidationErrors | null {
    const valor = control.value ?? '';
    if (!valor) return null;
    return /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/.test(valor)
      ? null
      : { soloLetras: true };
  }

  static contieneNumero(control: AbstractControl): ValidationErrors | null {
    return /\d/.test(control.value ?? '')
      ? null
      : { sinNumero: true };
  }

  static telefonoPeruano(control: AbstractControl): ValidationErrors | null {
    const valor = control.value ?? '';
    if (!valor) return null; // opcional
    return /^\d{9}$/.test(valor)
      ? null
      : { telefonoInvalido: true };
  }

  static dniPeruano(control: AbstractControl): ValidationErrors | null {
    const valor = control.value ?? '';
    if (!valor) return null; // opcional
    return /^\d{8}$/.test(valor)
      ? null
      : { dniInvalido: true };
  }

  static rucPeruano(control: AbstractControl): ValidationErrors | null {
    const valor = control.value ?? '';
    if (!valor) return null;
    return /^\d{11}$/.test(valor) ? null : { rucInvalido: true };
  }

  static horaCierreValida(group: AbstractControl): ValidationErrors | null {
    const apertura = group.get('hora_apertura')?.value;
    const cierre   = group.get('hora_cierre')?.value;
    if (!apertura || !cierre) return null;
    return cierre > apertura ? null : { horaCierreInvalida: true };
  }

  static limitarPrecio(event: Event, max: number): void {
    const input = event.target as HTMLInputElement;
    if (parseFloat(input.value) > max) {
        input.value = String(max);
    }
    }

  static soloLetrasInput(event: KeyboardEvent): boolean {
    const char = String.fromCharCode(event.charCode);
    return /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/.test(char);
    }

  static soloNumerosInput(event: KeyboardEvent): boolean {
    const char = String.fromCharCode(event.charCode);
    return /^\d$/.test(char);
  }

  static soloDecimalesInput(event: KeyboardEvent): boolean {
    const char = String.fromCharCode(event.charCode);
    const input = (event.target as HTMLInputElement).value;
    if (char === '.') return !input.includes('.');
    return /^\d$/.test(char);
    }

}



export const limits = {
  nombre:      { min: 2,  max: 50 },
  apellido:    { min: 2,  max: 50 },
  email:       { max: 254 },
  password:    { min: 6,  max: 35 },
  ruc:         { min: 11, max: 11 },
  razon_social:{ min: 3,  max: 200 },
  nombre_comercial: { min: 3, max: 150 },
  descripcion: { min: 8, max: 200 },
  direccion:   { min: 5, max: 255 },
  telefono:    { min: 9,  max: 9 },
  dni:           { min: 8,  max: 8 },
  precio:        { min: 0,  max: 9999.99 },
  nombre_producto: { min: 2, max: 50 },
  comentario:    { min: 10, max: 200 },
};