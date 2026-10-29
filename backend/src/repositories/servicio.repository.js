import { servicios } from '../data/dummyData.js';

/** Repositorio del catálogo de tratamientos (datos dummy en memoria). */

export const listar = ({ soloActivos = false } = {}) => servicios.filter((s) => !soloActivos || s.estado === 'ACTIVO');

export const buscarPorId = (idServicio) => servicios.find((s) => s.id_servicio === idServicio) ?? null;
