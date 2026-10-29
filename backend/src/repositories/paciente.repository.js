import { pacientes } from '../data/dummyData.js';

/** Repositorio de pacientes (datos dummy en memoria). */

const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Listado con búsqueda opcional por nombre, documento o correo; `idPaciente` limita a uno solo. */
export function listar({ q = '', idPaciente } = {}) {
  const texto = normalizar(q);
  return pacientes
    .filter((p) => idPaciente === undefined || p.id_paciente === idPaciente)
    .filter((p) => !texto || normalizar(`${p.nombres} ${p.apellidos} ${p.numero_documento} ${p.email}`).includes(texto));
}

export const buscarPorId = (idPaciente) => pacientes.find((p) => p.id_paciente === idPaciente) ?? null;
