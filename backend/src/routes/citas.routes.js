import { Router } from 'express';
import { verifyToken, requirePermission } from '../middlewares/auth.js';
import { PERMISOS } from '../config/permisos.js';
import * as citas from '../controllers/citas.controller.js';

/** /api/citas */
const router = Router();

// Pública: el modal "Agendar valoración" de index.html (sin sesión). Va ANTES de router.use(verifyToken),
// porque Express recorre las rutas en orden y todo lo que sigue exige token.
router.post('/solicitud-web', citas.solicitudWeb);
router.get('/todas', citas.listarTodas); // todas las citas dummy, sin token

router.use(verifyToken);

router.get('/', citas.listar); // el filtro por rol (el paciente solo ve las suyas) está en el servicio
router.post('/', requirePermission(PERMISOS.CREAR_CITA), citas.agendar);
// Quién puede pasar a cada estado depende del estado pedido y de la cita: lo decide el servicio.
router.patch('/:id/estado', citas.cambiarEstado);

export default router;
