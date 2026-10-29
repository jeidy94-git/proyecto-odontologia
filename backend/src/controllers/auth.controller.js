import * as authService from '../services/auth.service.js';

/**
 * Controlador de /api/auth. Un controlador solo traduce HTTP ↔ servicio: saca los datos de la
 * petición, llama al servicio y elige el código y el JSON de respuesta. Los errores los convierte
 * el manejador central (middlewares/error-handler.js).
 */

/** POST /api/auth/login { email, password } → 200 { success, token, expiresIn, user } */
export async function login(req, res) {
  const { token, expiresIn, user } = await authService.login(req.body ?? {});
  res.json({ success: true, message: `Bienvenido, ${user.nombre}`, token, expiresIn, user });
}
