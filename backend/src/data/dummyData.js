/**
 * Datos dummy en memoria (reemplazan a MySQL). Son los mismos registros semilla de
 * database/dentalcare_bd_v2.sql: mismos ids, nombres, horarios y catálogo.
 *
 * Solo los repositorios (src/repositories/) leen y modifican estos arreglos. Los cambios
 * (citas nuevas, cambios de estado) se pierden al reiniciar el servidor.
 *
 * Las contraseñas están en texto plano SOLO aquí, para poder probar el login en Postman:
 * usuario.repository.js las convierte a hash bcrypt al arrancar y descarta el texto plano.
 */

export const usuarios = [
  { id_usuario: 1, email: 'admin@dentalcare.com', password: 'Admin2026*', rol: 'ADMIN', nombre: 'Laura Gómez', estado: 'ACTIVO' },
  { id_usuario: 2, email: 'recepcion@dentalcare.com', password: 'Recep2026*', rol: 'ASISTENTE', nombre: 'Carlos Pérez', estado: 'ACTIVO' },
  { id_usuario: 3, email: 'dr.roberto@dentalcare.com', password: 'DocRoberto2026*', rol: 'DOCTOR', nombre: 'Dr. Roberto Martínez', estado: 'ACTIVO', id_especialista: 1 },
  { id_usuario: 4, email: 'dra.sofia@dentalcare.com', password: 'DraSofia2026*', rol: 'DOCTOR', nombre: 'Dra. Sofía López', estado: 'ACTIVO', id_especialista: 2 },
  { id_usuario: 5, email: 'dr.andres@dentalcare.com', password: 'DrAndres2026*', rol: 'DOCTOR', nombre: 'Dr. Andrés Ramírez', estado: 'ACTIVO', id_especialista: 3 },
  { id_usuario: 16, email: 'andres.galvis@gmail.com', password: 'AndresG2026*', rol: 'PACIENTE', nombre: 'Andrés Galvis', estado: 'ACTIVO', id_paciente: 11 },
  { id_usuario: 17, email: 'carolina.villa@hotmail.com', password: 'CarolinaV2026*', rol: 'PACIENTE', nombre: 'Carolina Villa', estado: 'ACTIVO', id_paciente: 12 },
];

export const pacientes = [
  { id_paciente: 11, tipo_documento: 'CC', numero_documento: '1036000101', nombres: 'Andrés', apellidos: 'Galvis', fecha_nacimiento: '1990-02-14', genero: 'MASCULINO', telefono: '3001110001', email: 'andres.galvis@gmail.com', eps_aseguradora: 'Sura' },
  { id_paciente: 12, tipo_documento: 'CC', numero_documento: '1036000102', nombres: 'Carolina', apellidos: 'Villa', fecha_nacimiento: '1993-05-20', genero: 'FEMENINO', telefono: '3001110002', email: 'carolina.villa@hotmail.com', eps_aseguradora: 'Sura' },
  { id_paciente: 13, tipo_documento: 'CC', numero_documento: '1036000103', nombres: 'Mateo', apellidos: 'Londoño', fecha_nacimiento: '1988-11-03', genero: 'MASCULINO', telefono: '3001110003', email: 'mateo.londono@outlook.com', eps_aseguradora: 'Sanitas' },
  { id_paciente: 14, tipo_documento: 'CC', numero_documento: '1036000104', nombres: 'Daniela', apellidos: 'Cardona', fecha_nacimiento: '1999-08-15', genero: 'FEMENINO', telefono: '3001110004', email: 'daniela.cardona@yahoo.com', eps_aseguradora: 'Sura' },
  { id_paciente: 15, tipo_documento: 'CC', numero_documento: '1036000105', nombres: 'Sebastián', apellidos: 'Marín', fecha_nacimiento: '1995-01-30', genero: 'MASCULINO', telefono: '3001110005', email: 'sebastian.marin@gmail.com', eps_aseguradora: 'Compensar' },
  { id_paciente: 16, tipo_documento: 'CC', numero_documento: '1036000106', nombres: 'Camila', apellidos: 'Restrepo', fecha_nacimiento: '1997-04-12', genero: 'FEMENINO', telefono: '3001110006', email: 'camila.restrepo@hotmail.com', eps_aseguradora: 'Sura' },
  { id_paciente: 17, tipo_documento: 'CC', numero_documento: '1036000107', nombres: 'Nicolás', apellidos: 'Arango', fecha_nacimiento: '1992-09-08', genero: 'MASCULINO', telefono: '3001110007', email: 'nicolas.arango@gmail.com', eps_aseguradora: 'Coomeva' },
  { id_paciente: 18, tipo_documento: 'CC', numero_documento: '1036000108', nombres: 'Mariana', apellidos: 'Zapata', fecha_nacimiento: '2000-06-25', genero: 'FEMENINO', telefono: '3001110008', email: 'mariana.zapata@outlook.com', eps_aseguradora: 'Sura' },
];

/** Odontólogos con sus rangos de atención (RN-02: solo se agenda dentro de estos horarios). */
export const especialistas = [
  {
    id_especialista: 1, nombre: 'Dr. Roberto Martínez', especialidad: 'Odontología General', registro_medico: 'RM-1001', estado: 'ACTIVO',
    horarios: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].flatMap((dia_semana) => [
      { dia_semana, hora_inicio: '08:00', hora_fin: '12:00' },
      { dia_semana, hora_inicio: '14:00', hora_fin: '18:00' },
    ]),
  },
  {
    id_especialista: 2, nombre: 'Dra. Sofía López', especialidad: 'Ortodoncia', registro_medico: 'RM-1002', estado: 'ACTIVO',
    horarios: [
      { dia_semana: 'Martes', hora_inicio: '08:00', hora_fin: '14:00' },
      { dia_semana: 'Jueves', hora_inicio: '08:00', hora_fin: '14:00' },
      { dia_semana: 'Sábado', hora_inicio: '08:00', hora_fin: '12:00' },
    ],
  },
  {
    id_especialista: 3, nombre: 'Dr. Andrés Ramírez', especialidad: 'Endodoncia', registro_medico: 'RM-1003', estado: 'ACTIVO',
    horarios: [
      { dia_semana: 'Miércoles', hora_inicio: '10:00', hora_fin: '16:00' },
      { dia_semana: 'Viernes', hora_inicio: '10:00', hora_fin: '16:00' },
    ],
  },
];

export const servicios = [
  { id_servicio: 1, codigo_servicio: 'SERV-001', nombre_servicio: 'Valoración General', descripcion: 'Consulta inicial y diagnóstico', precio_base: 50000, estado: 'ACTIVO' },
  { id_servicio: 2, codigo_servicio: 'SERV-002', nombre_servicio: 'Limpieza Dental Profunda', descripcion: 'Profilaxis y detartraje', precio_base: 120000, estado: 'ACTIVO' },
  { id_servicio: 3, codigo_servicio: 'SERV-003', nombre_servicio: 'Calza / Resina Estética', descripcion: 'Obturación en resina fotocurable', precio_base: 90000, estado: 'ACTIVO' },
  { id_servicio: 4, codigo_servicio: 'SERV-004', nombre_servicio: 'Tratamiento de Conducto', descripcion: 'Endodoncia unirradicular', precio_base: 350000, estado: 'ACTIVO' },
  { id_servicio: 5, codigo_servicio: 'SERV-005', nombre_servicio: 'Diseño de Sonrisa', descripcion: 'Carillas estéticas', precio_base: 1500000, estado: 'ACTIVO' },
];

/** Opciones de los <select> del modal "Agendar valoración" de index.html. */
export const especialidadesWeb = ['Valoración general', 'Ortodoncia', 'Estética dental', 'Implantología', 'Endodoncia', 'Periodoncia', 'Odontopediatría'];
export const sedesWeb = ['Bogotá · Chapinero', 'Bogotá · Usaquén', 'Medellín · El Poblado', 'Cali · Granada', 'Barranquilla · Alto Prado'];

/**
 * Solicitudes de valoración que llegan desde la landing (sin sesión). No son citas todavía:
 * recepción llama al paciente y, si acepta, agenda la cita real en POST /api/citas (con RN-02).
 */
export const solicitudesWeb = [];

/** fecha_hora 'AAAA-MM-DD HH:MM' (hora del consultorio). Todas caen dentro del horario de su odontólogo. */
export const citas = [
  { id_cita: 1, id_paciente: 11, id_especialista: 1, id_servicio: 1, fecha_hora: '2026-10-26 08:00', motivo: 'Valoración general y limpieza', estado: 'COMPLETADA' },
  { id_cita: 2, id_paciente: 12, id_especialista: 2, id_servicio: 1, fecha_hora: '2026-10-29 09:00', motivo: 'Control mensual de ortodoncia', estado: 'COMPLETADA' },
  { id_cita: 3, id_paciente: 13, id_especialista: 1, id_servicio: 3, fecha_hora: '2026-10-30 08:30', motivo: 'Dolor agudo en pieza molar', estado: 'PROGRAMADA' },
  { id_cita: 4, id_paciente: 14, id_especialista: 3, id_servicio: 4, fecha_hora: '2026-10-30 10:00', motivo: 'Evaluación para tratamiento de conducto', estado: 'PROGRAMADA' },
  { id_cita: 5, id_paciente: 15, id_especialista: 1, id_servicio: 1, fecha_hora: '2026-11-02 14:00', motivo: 'Primera valoración', estado: 'PENDIENTE_CONFIRMACION' },
  { id_cita: 6, id_paciente: 11, id_especialista: 1, id_servicio: 2, fecha_hora: '2026-11-03 09:00', motivo: 'Limpieza semestral', estado: 'PROGRAMADA' },
  { id_cita: 7, id_paciente: 17, id_especialista: 3, id_servicio: 4, fecha_hora: '2026-11-04 11:00', motivo: 'Segunda sesión de endodoncia', estado: 'CANCELADA' },
  { id_cita: 8, id_paciente: 16, id_especialista: 2, id_servicio: 5, fecha_hora: '2026-11-05 10:00', motivo: 'Diseño de sonrisa: valoración', estado: 'PENDIENTE_CONFIRMACION' },
  { id_cita: 9, id_paciente: 12, id_especialista: 1, id_servicio: 3, fecha_hora: '2026-11-06 15:00', motivo: 'Resina en incisivo', estado: 'PROGRAMADA' },
  { id_cita: 10, id_paciente: 18, id_especialista: 2, id_servicio: 1, fecha_hora: '2026-11-07 08:30', motivo: 'Control de brackets', estado: 'PROGRAMADA' },
];
