import { PERMISOS, puede } from '../config/permisos.js';
import { forbidden } from '../middlewares/error-handler.js';
import * as pacienteRepo from '../repositories/paciente.repository.js';

/**
 * Listado de pacientes con búsqueda (?q=). Qué ve cada rol:
 *   - PACIENTE: solo su propio registro.
 *   - Con GESTIONAR_PACIENTES (admin, asistente) o VER_HISTORIA_CLINICA (doctor): todos.
 */
export function listar(sesion, { q } = {}) {
  const texto = typeof q === 'string' ? q.trim().slice(0, 100) : '';
  if (sesion.user.rol === 'PACIENTE') return pacienteRepo.listar({ q: texto, idPaciente: sesion.user.id_paciente });
  if (puede(sesion, PERMISOS.GESTIONAR_PACIENTES, PERMISOS.VER_HISTORIA_CLINICA)) return pacienteRepo.listar({ q: texto });
  throw forbidden();
}
