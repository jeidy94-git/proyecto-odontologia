import { PERMISOS, ROLES, puede } from '../config/permisos.js';
import { ApiError, forbidden, noExiste } from '../middlewares/error-handler.js';
import { diaSemana, estadoFranja } from './agenda.js';
import * as citaRepo from '../repositories/cita.repository.js';
import * as pacienteRepo from '../repositories/paciente.repository.js';
import * as especialistaRepo from '../repositories/especialista.repository.js';
import * as servicioRepo from '../repositories/servicio.repository.js';

/**
 * Citas: listado filtrado por rol, agendamiento con RN-02 y cambios de estado.
 * `sesion` es { user, permisos } del usuario del token (lo deja verifyToken).
 * Las citas no se eliminan: se CANCELAN (queda la traza de lo que pasó).
 */

export const ESTADOS = ['PENDIENTE_CONFIRMACION', 'PROGRAMADA', 'COMPLETADA', 'CANCELADA'];

/** Máquina de estados: desde qué estado se puede pasar a cuál. */
const TRANSICIONES = {
  PENDIENTE_CONFIRMACION: ['PROGRAMADA', 'CANCELADA'],
  PROGRAMADA: ['COMPLETADA', 'CANCELADA'],
  COMPLETADA: [],
  CANCELADA: [],
};

/** ¿Quién puede llevar una cita a cada estado? */
const PUEDE_PASAR_A = {
  // Confirmar una solicitud del paciente es tarea de recepción (o del administrador).
  PROGRAMADA: (sesion) => [ROLES.ADMIN, ROLES.ASISTENTE].includes(sesion.user.rol),
  // Completar: el administrador o el odontólogo de ESA cita.
  COMPLETADA: (sesion, cita) => sesion.user.rol === ROLES.ADMIN || (sesion.user.rol === ROLES.DOCTOR && sesion.user.id_especialista === cita.id_especialista),
  // Cancelar: cualquier rol con CANCELAR_CITA (el paciente, solo las suyas: se revisa antes).
  CANCELADA: (sesion) => puede(sesion, PERMISOS.CANCELAR_CITA),
};

/* ---------- Validación ---------- */

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FECHA_HORA = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(?::00(?:\.0+)?)?$/;

/** Entero positivo (acepta 5 o '5') o null. */
const aId = (valor) => (/^[1-9]\d*$/.test(String(valor ?? '').trim()) ? Number(valor) : null);

/** '2026-02-30' tiene el formato pero no existe. */
const fechaExiste = (fecha) => {
  const [a, m, d] = fecha.split('-').map(Number);
  const f = new Date(Date.UTC(a, m - 1, d));
  return f.getUTCFullYear() === a && f.getUTCMonth() === m - 1 && f.getUTCDate() === d;
};

const lanzarSiHayErrores = (fields) => {
  if (Object.keys(fields).length) throw new ApiError(400, 'Revisa los datos enviados.', { code: 'VALIDATION', fields });
};

/* ---------- Consultas ---------- */

/**
 * GET /api/citas con filtros opcionales ?estado=&desde=&hasta=&id_paciente=&id_especialista=
 * Qué ve cada rol (según el token):
 *   - PACIENTE: solo sus citas.
 *   - DOCTOR: solo las de su agenda.
 *   - ADMIN y ASISTENTE: todas.
 */
export function listar(sesion, query = {}) {
  const fields = {};
  const estado = typeof query.estado === 'string' ? query.estado.trim().toUpperCase() : '';
  if (estado && !ESTADOS.includes(estado)) fields.estado = `Estado no válido. Usa: ${ESTADOS.join(', ')}.`;
  for (const campo of ['desde', 'hasta']) {
    if (query[campo] !== undefined && !(FECHA.test(query[campo]) && fechaExiste(query[campo]))) fields[campo] = 'Usa el formato AAAA-MM-DD.';
  }
  for (const campo of ['id_paciente', 'id_especialista']) {
    if (query[campo] !== undefined && !aId(query[campo])) fields[campo] = 'Debe ser un número entero positivo.';
  }
  lanzarSiHayErrores(fields);

  const filtros = {
    estado: estado || undefined,
    desde: query.desde,
    hasta: query.hasta,
    idPaciente: aId(query.id_paciente) ?? undefined,
    idEspecialista: aId(query.id_especialista) ?? undefined,
  };

  // El filtro por rol va DESPUÉS: lo que envíe el cliente en la URL no puede ampliarlo.
  if (sesion.user.rol === ROLES.PACIENTE) filtros.idPaciente = sesion.user.id_paciente;
  else if (sesion.user.rol === ROLES.DOCTOR) filtros.idEspecialista = sesion.user.id_especialista;
  else if (![ROLES.ADMIN, ROLES.ASISTENTE].includes(sesion.user.rol)) throw forbidden();

  return citaRepo.listar(filtros);
}

/** GET /api/citas/todas (pública, sin token): todas las citas dummy, sin filtros ni reglas por rol. */
export function listarTodas() {
  return citaRepo.listar();
}

/* ---------- Agendar (validación + RN-02) ---------- */

/**
 * POST /api/citas { id_paciente, id_especialista, id_servicio, fecha_hora, motivo }
 * El PACIENTE solo agenda para sí mismo (el id_paciente que envíe se ignora) y su cita queda en
 * PENDIENTE_CONFIRMACION hasta que recepción la confirme; el personal la crea PROGRAMADA.
 */
export function agendar(sesion, body = {}) {
  const esPaciente = sesion.user.rol === ROLES.PACIENTE;
  const datos = {
    id_paciente: esPaciente ? sesion.user.id_paciente : aId(body.id_paciente),
    id_especialista: aId(body.id_especialista),
    id_servicio: aId(body.id_servicio),
    fecha_hora: typeof body.fecha_hora === 'string' ? body.fecha_hora.trim() : '',
    motivo: typeof body.motivo === 'string' ? body.motivo.trim() : '',
  };

  // 1. Formato de los datos (400)
  const fields = {};
  if (!datos.id_paciente) fields.id_paciente = 'Indica el paciente (id_paciente).';
  if (!datos.id_especialista) fields.id_especialista = 'Indica el odontólogo (id_especialista).';
  if (!datos.id_servicio) fields.id_servicio = 'Indica el tratamiento (id_servicio).';
  const partes = datos.fecha_hora.match(FECHA_HORA);
  if (!partes || !fechaExiste(partes[1])) fields.fecha_hora = 'Usa el formato AAAA-MM-DD HH:MM (por ejemplo 2026-11-09 09:30).';
  if (!datos.motivo) fields.motivo = 'Escribe el motivo de la cita.';
  else if (datos.motivo.length > 255) fields.motivo = 'Máximo 255 caracteres.';
  lanzarSiHayErrores(fields);

  const [, fecha, hora] = partes;
  const fechaHora = `${fecha} ${hora}`;

  // 2. Las referencias existen y se pueden agendar (404 / 422)
  if (!pacienteRepo.buscarPorId(datos.id_paciente)) throw noExiste('El paciente');
  const especialista = especialistaRepo.buscarPorId(datos.id_especialista);
  if (!especialista) throw noExiste('El odontólogo');
  if (especialista.estado !== 'ACTIVO') throw new ApiError(422, 'Ese odontólogo no está disponible.', { code: 'INACTIVE_SPECIALIST' });
  const servicio = servicioRepo.buscarPorId(datos.id_servicio);
  if (!servicio) throw noExiste('El tratamiento');
  if (servicio.estado !== 'ACTIVO') throw new ApiError(422, 'Ese tratamiento no está disponible.', { code: 'INACTIVE_SERVICE' });

  // 3. RN-02 contra las citas existentes (422 / 409). Sin `await` hasta guardar: nadie se cuela.
  const estado = estadoFranja({
    fecha,
    hora,
    horarios: especialistaRepo.horariosDelDia(especialista.id_especialista, diaSemana(fecha)),
    ocupadas: citaRepo.horasOcupadas(especialista.id_especialista, fecha),
  });
  if (estado === 'fuera_de_horario') {
    throw new ApiError(422, `${especialista.nombre} no atiende el ${diaSemana(fecha).toLowerCase()} ${fecha} a las ${hora} (RN-02).`, {
      code: 'NO_SCHEDULE',
      fields: { fecha_hora: 'Fuera del horario del odontólogo o no es una franja de 30 minutos (:00 o :30).' },
    });
  }
  if (estado === 'pasada') throw new ApiError(422, 'No se pueden agendar citas en horas pasadas.', { code: 'PAST_SLOT', fields: { fecha_hora: 'Esa hora ya pasó.' } });
  if (estado === 'ocupada') throw new ApiError(409, 'Esa franja ya está ocupada.', { code: 'SLOT_TAKEN', fields: { fecha_hora: 'Franja ocupada. Elige otra.' } });
  if (citaRepo.pacienteOcupado(datos.id_paciente, fechaHora)) throw new ApiError(409, 'El paciente ya tiene otra cita a esa hora.', { code: 'PATIENT_BUSY' });

  return citaRepo.crear({
    id_paciente: datos.id_paciente,
    id_especialista: datos.id_especialista,
    id_servicio: datos.id_servicio,
    fecha_hora: fechaHora,
    motivo: datos.motivo,
    estado: esPaciente ? 'PENDIENTE_CONFIRMACION' : 'PROGRAMADA',
  });
}

/* ---------- Cambios de estado ---------- */

/** PATCH /api/citas/:id/estado { estado: PROGRAMADA | COMPLETADA | CANCELADA } */
export function cambiarEstado(sesion, idCita, body = {}) {
  const id = aId(idCita);
  const cita = id && citaRepo.buscarPorId(id);
  if (!cita) throw noExiste('La cita');

  const estado = typeof body.estado === 'string' ? body.estado.trim().toUpperCase() : '';
  if (!PUEDE_PASAR_A[estado]) {
    throw new ApiError(400, 'Revisa los datos enviados.', { code: 'VALIDATION', fields: { estado: `Usa uno de: ${Object.keys(PUEDE_PASAR_A).join(', ')}.` } });
  }

  if (sesion.user.rol === ROLES.PACIENTE && cita.id_paciente !== sesion.user.id_paciente) throw forbidden('Solo puedes modificar tus propias citas.');
  if (!PUEDE_PASAR_A[estado](sesion, cita)) throw forbidden();
  if (!TRANSICIONES[cita.estado].includes(estado)) {
    throw new ApiError(409, `Una cita en estado ${cita.estado} no puede pasar a ${estado}.`, { code: 'INVALID_TRANSITION' });
  }

  return citaRepo.actualizarEstado(id, estado);
}
