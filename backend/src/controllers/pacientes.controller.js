import { sesionDe } from '../middlewares/auth.js';
import * as pacientesService from '../services/pacientes.service.js';

/** GET /api/pacientes?q= → 200 { success, count, data } (el filtro por rol está en el servicio) */
export function listar(req, res) {
  const data = pacientesService.listar(sesionDe(req), req.query);
  res.json({ success: true, count: data.length, data });
}
