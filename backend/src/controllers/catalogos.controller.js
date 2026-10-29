import { sesionDe } from '../middlewares/auth.js';
import * as catalogosService from '../services/catalogos.service.js';

/** Controlador de GET /api/servicios y GET /api/especialistas (?soloActivos=true). */

export function servicios(req, res) {
  const data = catalogosService.servicios(sesionDe(req), req.query);
  res.json({ success: true, count: data.length, data });
}

/** GET /api/tratamientos (pública) → 200 { success, count, data } */
export function tratamientos(req, res) {
  const data = catalogosService.tratamientosPublicos();
  res.json({ success: true, count: data.length, data });
}

export function especialistas(req, res) {
  const data = catalogosService.especialistas(sesionDe(req), req.query);
  res.json({ success: true, count: data.length, data });
}
