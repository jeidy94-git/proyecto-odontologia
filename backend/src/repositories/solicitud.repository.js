import { solicitudesWeb, especialidadesWeb, sedesWeb } from '../data/dummyData.js';

/** Repositorio de las solicitudes de valoración de la landing (datos dummy en memoria). */

export const especialidades = () => especialidadesWeb;

export const sedes = () => sedesWeb;

export function crear(datos) {
  const solicitud = { id_solicitud: solicitudesWeb.length + 1, ...datos };
  solicitudesWeb.push(solicitud);
  return solicitud;
}
