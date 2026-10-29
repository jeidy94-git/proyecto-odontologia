import { citas, pacientes, especialistas, servicios } from '../data/dummyData.js';

/**
 * Repositorio de citas (datos dummy en memoria). Las funciones son síncronas: Node atiende una
 * petición a la vez entre cada `await`, así que revisar la franja y guardar la cita sin un `await`
 * de por medio equivale a la transacción con bloqueo que se usaría en MySQL (nadie se cuela).
 */

/** Cita con los nombres del paciente, el odontólogo y el tratamiento (lo que haría un JOIN). */
function conNombres(cita) {
  const paciente = pacientes.find((p) => p.id_paciente === cita.id_paciente);
  const especialista = especialistas.find((e) => e.id_especialista === cita.id_especialista);
  const servicio = servicios.find((s) => s.id_servicio === cita.id_servicio);
  return {
    ...cita,
    paciente: paciente ? `${paciente.nombres} ${paciente.apellidos}` : null,
    especialista: especialista?.nombre ?? null,
    servicio: servicio?.nombre_servicio ?? null,
  };
}

/** Filtros opcionales: idPaciente, idEspecialista, estado, desde y hasta ('AAAA-MM-DD'). Ordenadas por fecha. */
export function listar({ idPaciente, idEspecialista, estado, desde, hasta } = {}) {
  return citas
    .filter((c) => idPaciente === undefined || c.id_paciente === idPaciente)
    .filter((c) => idEspecialista === undefined || c.id_especialista === idEspecialista)
    .filter((c) => !estado || c.estado === estado)
    .filter((c) => !desde || c.fecha_hora.slice(0, 10) >= desde)
    .filter((c) => !hasta || c.fecha_hora.slice(0, 10) <= hasta)
    .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora))
    .map(conNombres);
}

export function buscarPorId(idCita) {
  const cita = citas.find((c) => c.id_cita === idCita);
  return cita ? conNombres(cita) : null;
}

/** Horas 'HH:MM' ya tomadas por un odontólogo ese día (las canceladas liberan la franja). */
export const horasOcupadas = (idEspecialista, fecha) =>
  citas.filter((c) => c.id_especialista === idEspecialista && c.estado !== 'CANCELADA' && c.fecha_hora.startsWith(fecha)).map((c) => c.fecha_hora.slice(11, 16));

/** ¿El paciente ya tiene otra cita activa a esa misma hora? */
export const pacienteOcupado = (idPaciente, fechaHora) => citas.some((c) => c.id_paciente === idPaciente && c.estado !== 'CANCELADA' && c.fecha_hora === fechaHora);

export function crear(datos) {
  const cita = { id_cita: Math.max(0, ...citas.map((c) => c.id_cita)) + 1, ...datos };
  citas.push(cita);
  return conNombres(cita);
}

export function actualizarEstado(idCita, estado) {
  const cita = citas.find((c) => c.id_cita === idCita);
  cita.estado = estado;
  return conNombres(cita);
}
