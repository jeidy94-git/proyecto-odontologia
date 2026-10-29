import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.js';
import * as catalogos from '../controllers/catalogos.controller.js';

/**
 * /api/servicios y /api/especialistas (solo lectura, con sesión; los usan todos los roles al agendar).
 * verifyToken va en cada ruta y NO con router.use(): este router se monta en /api, y un router.use()
 * exigiría token también a rutas inexistentes (darían 401 en vez de 404).
 */
const router = Router();

// Pública (sin verifyToken): los servicios activos, para mostrarlos sin iniciar sesión.
router.get('/tratamientos', catalogos.tratamientos);
router.get('/servicios', verifyToken, catalogos.servicios);
router.get('/especialistas', verifyToken, catalogos.especialistas);

export default router;
