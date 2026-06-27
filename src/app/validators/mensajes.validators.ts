export const MENSAJES_ERROR: Record<string, Record<string, string>> = {
  nombre: {
    required:     'El nombre es obligatorio.',
    minlength:    'Mínimo 2 caracteres.',
    maxlength:    'Máximo 100 caracteres.',
    soloLetras:   'Solo se permiten letras y espacios.',
  },
  apellido: {
    required:     'El apellido es obligatorio.',
    minlength:    'Mínimo 2 caracteres.',
    maxlength:    'Máximo 100 caracteres.',
    soloLetras:   'Solo se permiten letras y espacios.',
  },
  email: {
    required:     'El correo es obligatorio.',
    email:        'Ingresa un correo válido.',
    maxlength:    'Máximo 254 caracteres.',
  },
  telefono: {
    telefonoInvalido: 'El celular debe tener exactamente 9 dígitos.',
  },
  password: {
    required:     'La contraseña es obligatoria.',
    minlength:    'Mínimo 6 caracteres.',
    maxlength:    'Máximo 35 caracteres.',
    sinNumero:    'Debe contener al menos un número.',
  },
  dni: {
    dniInvalido:  'El DNI debe tener exactamente 8 dígitos.',
  },
  ruc: {
    required:    'El RUC es obligatorio.',
    rucInvalido: 'El RUC debe tener exactamente 11 dígitos.',
},
  razon_social: {
    required:  'La razón social es obligatoria.',
    minlength: 'Mínimo 3 caracteres.',
    maxlength: 'Máximo 200 caracteres.',
  },
  nombre_comercial: {
    required:  'El nombre comercial es obligatorio.',
    minlength: 'Mínimo 3 caracteres.',
    maxlength: 'Máximo 150 caracteres.',
  },
  descripcion: {
    required:  'La descripción es obligatoria.',
    minlength: 'Mínimo 10 caracteres.',
    maxlength: 'Máximo 200 caracteres.',
  },
  direccion: {
    required:  'La dirección es obligatoria.',
    minlength: 'Mínimo 10 caracteres.',
    maxlength: 'Máximo 255 caracteres.',
  },
  hora_cierre: {
    horaCierreInvalida: 'La hora de cierre debe ser mayor que la de apertura.',
  },  
};