import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.js';
import * as pacientes from '../controllers/pacientes.controller.js';

/** /api/pacientes — exige sesión; qué pacientes ve cada rol lo decide el servicio. */
const router = Router();
router.use(verifyToken);

router.get('/', pacientes.listar);

export default router;
