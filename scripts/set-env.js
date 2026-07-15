// Inyecta la URL del API Gateway (ngrok) en environment.prod.ts antes del build.
// Se ejecuta en Vercel (variable de entorno API_URL) o localmente antes de un
// `ng build` de producción. Si API_URL no está definida o el placeholder no
// aparece en el archivo, el script corta el build con exit code != 0: es
// preferible que el deploy falle a que se publique apuntando al propio
// dominio de Vercel (placeholder sin reemplazar tratado como ruta relativa).
const fs = require('fs');
const path = require('path');

const PLACEHOLDER = '__API_URL__';
const apiUrl = process.env['API_URL'];
const targetPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

if (!apiUrl) {
  console.error('[set-env] ERROR: falta la variable de entorno API_URL (Vercel > Project Settings > Environment Variables). Build abortado.');
  process.exit(1);
}

const original = fs.readFileSync(targetPath, 'utf8');
if (!original.includes(PLACEHOLDER)) {
  console.error(`[set-env] ERROR: no se encontró el placeholder ${PLACEHOLDER} en ${targetPath}. Build abortado.`);
  process.exit(1);
}

const content = original.replace(PLACEHOLDER, apiUrl.replace(/\/+$/, ''));
fs.writeFileSync(targetPath, content);
console.log(`[set-env] apiUrl de producción configurado a: ${apiUrl}`);
