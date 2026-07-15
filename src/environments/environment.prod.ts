// apiUrl se reemplaza en build time por scripts/set-env.js, que lee la
// variable de entorno API_URL configurada en Vercel (Project Settings >
// Environment Variables). Ese valor es la URL https que imprime ngrok
// (o el dominio estático de ngrok) apuntando al API Gateway local.
export const environment = {
  production: true,
  apiUrl: '__API_URL__',
  appName: 'LlegaYa',
  appSlogan: 'Conectando barrios con un solo clic',
};
