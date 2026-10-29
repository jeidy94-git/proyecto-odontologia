import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { puede } from '../config/permisos.js';
import { ApiError, unauthorized, forbidden } from './error-handler.js';
import * as authService from '../services/auth.service.js';

/**
 * verifyToken: protege una ruta. Exige el encabezado `Authorization: Bearer <token>`.
 *
 *  1. Verifica la FIRMA del JWT con el secreto de config/env.js: si alguien cambió el contenido
 *     (por ejemplo el rol), la firma ya no coincide. Solo se acepta HS256 (evita "alg: none").
 *  2. Verifica que no haya VENCIDO (exp, 8 horas).
 *  3. Busca al usuario: debe existir y seguir ACTIVO (así una cuenta se puede "apagar" antes de
 *     que venza su token). Los permisos salen de la matriz del rol, no del token.
 *
 * Deja en la petición `req.user` (el usuario de la sesión) y `req.permisos`.
 */
export function verifyToken(req, res, next) {
  const [scheme, token] = (req.get('Authorization') ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) throw unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.secret, { algorithms: ['HS256'] });
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw unauthorized('Tu sesión venció. Ingresa de nuevo.', 'TOKEN_EXPIRED');
    throw unauthorized('La sesión no es válida. Ingresa de nuevo.', 'INVALID_TOKEN');
  }

  const sesion = authService.sesion(Number(payload.sub));
  if (!sesion) throw unauthorized('La sesión no es válida. Ingresa de nuevo.', 'INVALID_TOKEN');
  if (!sesion.activo) throw new ApiError(401, 'Tu cuenta está inactiva. Comunícate con el centro odontológico.', { code: 'INACTIVE' });

  req.user = sesion.user;
  req.permisos = sesion.permisos;
  next();
}

/** La sesión { user, permisos } que los controladores pasan a los servicios (los servicios no reciben `req`). */
export const sesionDe = (req) => ({ user: req.user, permisos: req.permisos });

/**
 * requirePermission: autoriza (403) después de verifyToken (401). Va en la ruta:
 *   router.post('/', requirePermission(PERMISOS.CREAR_CITA), citas.agendar)
 * Pasa si el rol del usuario tiene ALGUNO de los permisos indicados.
 */
export const requirePermission =
  (...permisos) =>
  (req, res, next) => {
    if (!puede(sesionDe(req), ...permisos)) throw forbidden();
    next();
  };
