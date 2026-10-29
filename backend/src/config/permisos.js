/**
 * Permisos y matriz rol → permisos (la misma de las tablas `permiso` y `rol_permiso` de
 * database/dentalcare_bd_v2.sql). requirePermission() consulta esta matriz en cada petición.
 */
export const PERMISOS = Object.freeze({
  CREAR_CITA: 'CREAR_CITA',
  CANCELAR_CITA: 'CANCELAR_CITA',
  VER_HISTORIA_CLINICA: 'VER_HISTORIA_CLINICA',
  EDITAR_HISTORIA_CLINICA: 'EDITAR_HISTORIA_CLINICA',
  GESTIONAR_USUARIOS: 'GESTIONAR_USUARIOS',
  REGISTRAR_PAGO: 'REGISTRAR_PAGO',
  GESTIONAR_PACIENTES: 'GESTIONAR_PACIENTES',
  GESTIONAR_SERVICIOS: 'GESTIONAR_SERVICIOS',
  GESTIONAR_ESPECIALISTAS: 'GESTIONAR_ESPECIALISTAS',
  REGISTRAR_NOVEDAD: 'REGISTRAR_NOVEDAD',
  GESTIONAR_NOVEDADES: 'GESTIONAR_NOVEDADES',
});

export const ROLES = Object.freeze({ ADMIN: 'ADMIN', ASISTENTE: 'ASISTENTE', DOCTOR: 'DOCTOR', PACIENTE: 'PACIENTE' });

const P = PERMISOS;

export const PERMISOS_POR_ROL = Object.freeze({
  ADMIN: Object.values(P),
  ASISTENTE: [P.CREAR_CITA, P.CANCELAR_CITA, P.REGISTRAR_PAGO, P.GESTIONAR_PACIENTES, P.REGISTRAR_NOVEDAD],
  DOCTOR: [P.CREAR_CITA, P.CANCELAR_CITA, P.VER_HISTORIA_CLINICA, P.EDITAR_HISTORIA_CLINICA, P.REGISTRAR_NOVEDAD],
  PACIENTE: [P.CREAR_CITA, P.CANCELAR_CITA],
});

/** ¿La sesión { user, permisos } tiene ALGUNO de estos permisos? */
export const puede = (sesion, ...permisos) => permisos.some((permiso) => sesion.permisos.includes(permiso));
