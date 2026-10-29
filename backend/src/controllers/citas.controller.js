import { sesionDe } from '../middlewares/auth.js';
import * as citasService from '../services/citas.service.js';
import * as solicitudesService from '../services/solicitudes.service.js';

/** Controlador de /api/citas (las reglas están en services/citas.service.js). */

/** GET /api/citas?estado&desde&hasta&id_paciente&id_especialista → 200 { success, count, data } */
export function listar(req, res) {
  const citas = citasService.listar(sesionDe(req), req.query);
  res.json({ success: true, count: citas.length, data: citas });
}

/** GET /api/citas/todas (pública) → 200 { success, count, data } */
export function listarTodas(req, res) {
  const citas = citasService.listarTodas();
  res.json({ success: true, count: citas.length, data: citas });
}

/** POST /api/citas → 201 cita + Location | 400 | 404 | 409 franja ocupada | 422 RN-02 */
export function agendar(req, res) {
  const cita = citasService.agendar(sesionDe(req), req.body ?? {});
  res.status(201).location(`/api/citas/${cita.id_cita}`).json({ success: true, message: 'Cita agendada correctamente', data: cita });
}

/** POST /api/citas/solicitud-web { nombre, telefono, fecha, especialidad, sede } (pública) → 201 | 400 */
export function solicitudWeb(req, res) {
  const solicitud = solicitudesService.registrar(req.body ?? {});
  res.status(201).json({
    success: true,
    message: `Recibimos tu solicitud n.º ${solicitud.id_solicitud} para ${solicitud.especialidad} el ${solicitud.fecha} en ${solicitud.sede}. Te llamaremos para confirmar el horario.`,
    data: solicitud,
  });
}

/** PATCH /api/citas/:id/estado { estado } → 200 | 400 | 403 | 404 | 409 transición no permitida */
export function cambiarEstado(req, res) {
  const cita = citasService.cambiarEstado(sesionDe(req), req.params.id, req.body ?? {});
  res.json({ success: true, message: `La cita #${cita.id_cita} quedó en estado ${cita.estado}`, data: cita });
}
