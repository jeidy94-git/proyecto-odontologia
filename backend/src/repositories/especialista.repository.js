import { especialistas } from '../data/dummyData.js';

/** Repositorio de odontólogos y sus horarios (datos dummy en memoria). */

export const listar = ({ soloActivos = false } = {}) => especialistas.filter((e) => !soloActivos || e.estado === 'ACTIVO');

export const buscarPorId = (idEspecialista) => especialistas.find((e) => e.id_especialista === idEspecialista) ?? null;

/** Rangos de atención de un odontólogo en un día de la semana ('Lunes'…'Sábado'). */
export const horariosDelDia = (idEspecialista, diaSemana) => buscarPorId(idEspecialista)?.horarios.filter((h) => h.dia_semana === diaSemana) ?? [];
