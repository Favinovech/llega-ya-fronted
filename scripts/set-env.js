// Inyecta la URL del API Gateway (ngrok) en environment.prod.ts antes del build.
// Se ejecuta en Vercel (variable de entorno API_URL) o localmente antes de un
// `ng build` de producción. Si API_URL no está definida, deja el placeholder
// y `ng build` fallará explícitamente al usar una URL inválida (mejor que
// desplegar apuntando a un backend equivocado en silencio).
const fs = require('fs');
const path = require('path');

const apiUrl = process.env['API_URL'];
const targetPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

if (!apiUrl) {
  console.warn('[set-env] Variable de entorno API_URL no definida. environment.prod.ts queda con el placeholder __API_URL__.');
  process.exit(0);
}

const content = fs.readFileSync(targetPath, 'utf8').replace('__API_URL__', apiUrl.replace(/\/+$/, ''));
fs.writeFileSync(targetPath, content);
console.log(`[set-env] apiUrl de producción configurado a: ${apiUrl}`);
