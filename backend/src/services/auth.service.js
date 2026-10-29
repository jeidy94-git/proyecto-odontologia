import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { PERMISOS_POR_ROL } from '../config/permisos.js';
import { ApiError } from '../middlewares/error-handler.js';
import * as usuarioRepo from '../repositories/usuario.repository.js';

/**
 * Autenticación. Un servicio tiene la lógica de negocio y no sabe nada de HTTP (ni `req` ni `res`):
 * recibe datos, aplica las reglas, usa los repositorios y devuelve un resultado o lanza un ApiError.
 */

const CREDENCIALES_INVALIDAS = 'Correo o contraseña incorrectos.';

/**
 * Hash de relleno para cuando el correo NO existe: comparar contra él tarda lo mismo que una
 * comparación real. Sin esto, midiendo el tiempo de respuesta se sabría qué correos existen.
 */
const HASH_FALSO = bcrypt.hashSync('hash-de-relleno-para-tiempo-constante', 10);

/** Datos públicos del usuario (sin el hash de la contraseña). */
const publico = ({ password_hash, estado, ...user }) => user;

/** Sesión de un usuario: { user, activo, permisos } o null. La usa verifyToken en cada petición. */
export function sesion(idUsuario) {
  const cuenta = usuarioRepo.buscarPorId(idUsuario);
  if (!cuenta) return null;
  return { user: publico(cuenta), activo: cuenta.estado === 'ACTIVO', permisos: PERMISOS_POR_ROL[cuenta.rol] ?? [] };
}

/** { email, password } → { token, expiresIn, user } */
export async function login(body = {}) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const fields = {};
  if (!email) fields.email = 'Escribe tu correo electrónico.';
  if (!password) fields.password = 'Escribe tu contraseña.';
  if (Object.keys(fields).length) throw new ApiError(400, 'Revisa los datos del formulario.', { code: 'VALIDATION', fields });

  const cuenta = usuarioRepo.buscarPorEmail(email);
  // bcrypt.compare SIEMPRE se ejecuta (con el hash real o el de relleno): tiempo constante.
  const coincide = await bcrypt.compare(password, cuenta?.password_hash ?? HASH_FALSO);
  // El MISMO mensaje si el correo no existe o si la contraseña está mal.
  if (!cuenta || !coincide) throw new ApiError(401, CREDENCIALES_INVALIDAS, { code: 'INVALID_CREDENTIALS' });
  if (cuenta.estado !== 'ACTIVO') throw new ApiError(403, 'Tu cuenta está inactiva. Comunícate con el centro odontológico.', { code: 'INACTIVE' });

  // El token lleva lo mínimo: quién es (sub) y su rol. Un JWT se puede LEER (base64);
  // lo que no se puede es MODIFICAR sin invalidar la firma.
  const token = jwt.sign({ rol: cuenta.rol }, env.jwt.secret, { subject: String(cuenta.id_usuario), expiresIn: env.jwt.expiresIn, algorithm: 'HS256' });
  return { token, expiresIn: env.jwt.expiresIn, user: publico(cuenta) };
}
