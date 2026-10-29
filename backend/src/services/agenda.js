/**
 * RN-02 (agenda): una cita solo se agenda en una franja de 30 minutos que
 *   - esté dentro del horario de atención del odontólogo ese día de la semana,
 *   - no haya pasado,
 *   - y no esté ocupada por otra cita activa del mismo odontólogo.
 *
 * Son funciones PURAS (reciben `ahora`), así que se prueban con cualquier fecha.
 */

export const MINUTOS_FRANJA = 30;

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** '2026-11-03' → 'Martes' (en UTC, para que la zona horaria no corra el día). */
export function diaSemana(fechaIso) {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return DIAS_SEMANA[new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()];
}

/** '09:30' → 570 */
export const aMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

/** Fecha y hora locales del consultorio: { fecha: 'AAAA-MM-DD', minuto } */
function momento(ahora) {
  const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
  return { fecha, minuto: ahora.getHours() * 60 + ahora.getMinutes() };
}

/**
 * Estado de la franja que empieza en `hora` para un odontólogo:
 * 'fuera_de_horario' | 'pasada' | 'ocupada' | 'disponible'.
 * @param {object} p
 * @param {string} p.fecha     'AAAA-MM-DD'
 * @param {string} p.hora      'HH:MM'
 * @param {Array<{hora_inicio: string, hora_fin: string}>} p.horarios  rangos de ESE día
 * @param {string[]} p.ocupadas  horas 'HH:MM' ya tomadas (citas no canceladas)
 */
export function estadoFranja({ fecha, hora, horarios, ocupadas, ahora = new Date() }) {
  const inicio = aMinutos(hora);
  const enCuadricula = inicio % MINUTOS_FRANJA === 0;
  const dentro = horarios.some((h) => inicio >= aMinutos(h.hora_inicio) && inicio + MINUTOS_FRANJA <= aMinutos(h.hora_fin));
  if (!enCuadricula || !dentro) return 'fuera_de_horario';

  const hoy = momento(ahora);
  if (fecha < hoy.fecha || (fecha === hoy.fecha && inicio <= hoy.minuto)) return 'pasada';
  if (ocupadas.includes(hora)) return 'ocupada';
  return 'disponible';
}
