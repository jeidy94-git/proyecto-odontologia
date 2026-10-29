import express from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './middlewares/error-handler.js';
import authRoutes from './routes/auth.routes.js';
import citasRoutes from './routes/citas.routes.js';
import catalogosRoutes from './routes/catalogos.routes.js';
import pacientesRoutes from './routes/pacientes.routes.js';

/**
 * Aplicación Express. Está separada de server.js (que solo hace `listen`) para poder levantarla
 * en pruebas en un puerto libre.
 *
 * Recorrido de una petición (5 capas):
 *   CORS → JSON → ruta → middlewares (verifyToken → requirePermission) → controlador → servicio
 *   → repositorio (datos dummy) … y si algo falla: → 404 → manejador de errores
 */
const app = express();

app.disable('x-powered-by'); // no anunciar "Express" en cada respuesta
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.use('/api/auth', authRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api', catalogosRoutes); // /api/servicios y /api/especialistas

app.use(notFound);
app.use(errorHandler);

export default app;
