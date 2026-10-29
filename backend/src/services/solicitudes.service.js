import { ApiError } from '../middlewares/error-handler.js';
import * as solicitudRepo from '../repositories/solicitud.repository.js';

/**
 * Solicitud de valoración desde la landing (pública, sin token). Solo registra los datos de
 * contacto: no ocupa franjas ni aplica RN-02, porque aún no hay odontólogo ni hora. Recepción
 * confirma por teléfono y agenda la cita real en POST /api/citas.
 */

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

/** Fecha local del consultorio 'AAAA-MM-DD' (process.env.TZ se fija en config/env.js). */
const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const fechaExiste = (fecha) => {
  const [a, m, d] = fecha.split('-').map(Number);
  const f = new Date(Date.UTC(a, m - 1, d));
  return f.getUTCFullYear() === a && f.getUTCMonth() === m - 1 && f.getUTCDate() === d;
};

/** { nombre, telefono, fecha, especialidad, sede } → solicitud registrada | 400 */
export function registrar(body = {}) {
  const datos = {
    nombre: texto(body.nombre),
    telefono: texto(body.telefono),
    fecha: texto(body.fecha),
    especialidad: texto(body.especialidad),
    sede: texto(body.sede),
  };

  const fields = {};
  if (datos.nombre.length < 3 || datos.nombre.length > 100) fields.nombre = 'El nombre debe tener entre 3 y 100 caracteres.';
  if (!/^\+?\d{7,15}$/.test(datos.telefono.replace(/[\s()-]/g, ''))) fields.telefono = 'El teléfono debe tener entre 7 y 15 dígitos.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) || !fechaExiste(datos.fecha)) fields.fecha = 'La fecha no es válida (AAAA-MM-DD).';
  else if (datos.fecha < hoy()) fields.fecha = 'La fecha preferida no puede ser anterior a hoy.';
  if (!solicitudRepo.especialidades().includes(datos.especialidad)) fields.especialidad = 'Selecciona una especialidad de la lista.';
  if (!solicitudRepo.sedes().includes(datos.sede)) fields.sede = 'Selecciona una sede de la lista.';
  if (Object.keys(fields).length) throw new ApiError(400, 'Revisa los datos de la solicitud.', { code: 'VALIDATION', fields });

  return solicitudRepo.crear({ ...datos, estado: 'PENDIENTE_LLAMADA', origen: 'WEB', creadaEn: new Date().toISOString() });
}
