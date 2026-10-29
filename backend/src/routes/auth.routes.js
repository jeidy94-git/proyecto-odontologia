import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';

/** /api/auth — pública: es donde se obtiene el token. */
const router = Router();

router.post('/login', auth.login);

export default router;
