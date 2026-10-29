/**
 * Configuración del servidor. Cada valor se puede reemplazar con una variable de entorno
 * (por ejemplo `PORT=4000 npm start`); si no existe, se usa el valor por defecto.
 *
 * JWT_SECRET firma TODOS los tokens: quien lo conozca puede fabricar un token de administrador.
 * El valor por defecto sirve solo para desarrollo y pruebas en Postman; en producción se define
 * la variable de entorno JWT_SECRET con un texto largo al azar.
 */

// Zona horaria del consultorio: decide qué franjas de la agenda "ya pasaron" (RN-02).
process.env.TZ = process.env.TZ || 'America/Bogota';

export const env = Object.freeze({
  port: Number(process.env.PORT) || 3000,
  jwt: Object.freeze({
    secret: process.env.JWT_SECRET || 'dentalcare-secreto-de-desarrollo-cambiar-en-produccion-2026',
    expiresIn: '8h', // una jornada de trabajo
  }),
});
