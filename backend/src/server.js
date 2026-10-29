import { env } from './config/env.js';
import app from './app.js';

/** Punto de entrada: `npm start` (o `npm run dev`, que reinicia al guardar un archivo). */
const server = app.listen(env.port, () => {
  const url = `http://localhost:${env.port}/api`;
  console.log(`API DentalCare escuchando en ${url} (datos dummy en memoria)`);
  console.log(`  POST  ${url}/auth/login`);
  console.log(`  GET   ${url}/citas            POST ${url}/citas`);
  console.log(`  PATCH ${url}/citas/:id/estado    GET  ${url}/citas/todas (pública)`);
  console.log(`  GET   ${url}/servicios        GET  ${url}/especialistas`);
  console.log(`  GET   ${url}/pacientes        GET  ${url}/tratamientos (pública)`);
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? `El puerto ${env.port} ya está en uso. Cierra el otro servidor o usa PORT=3001 npm start.` : error);
  process.exit(1);
});
