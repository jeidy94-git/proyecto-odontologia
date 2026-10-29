import * as servicioRepo from '../repositories/servicio.repository.js';
import * as especialistaRepo from '../repositories/especialista.repository.js';

/**
 * Catálogos de solo lectura que necesita la agenda: tratamientos y odontólogos con sus horarios.
 * El PACIENTE solo ve lo ACTIVO (lo inactivo no se puede agendar); el personal puede pedir todo.
 */

const soloActivos = (sesion, query) => query.soloActivos === 'true' || sesion.user.rol === 'PACIENTE';

export const servicios = (sesion, query = {}) => servicioRepo.listar({ soloActivos: soloActivos(sesion, query) });

/** GET /api/tratamientos (pública, sin sesión): solo los servicios ACTIVOS, que son los que se pueden agendar. */
export const tratamientosPublicos = () => servicioRepo.listar({ soloActivos: true });

export const especialistas = (sesion, query = {}) => especialistaRepo.listar({ soloActivos: soloActivos(sesion, query) });
