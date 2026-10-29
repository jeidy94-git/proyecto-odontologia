import bcrypt from 'bcryptjs';
import { usuarios as datos } from '../data/dummyData.js';

/**
 * Repositorio de usuarios. Al cargar el módulo cada contraseña de dummyData.js se convierte en un
 * hash bcrypt (costo 10) y el texto plano no se guarda: el login compara contra el hash, igual que
 * haría con la columna `password_hash` de MySQL.
 */
const usuarios = datos.map(({ password, ...usuario }) => ({ ...usuario, password_hash: bcrypt.hashSync(password, 10) }));

export const buscarPorEmail = (email) => usuarios.find((u) => u.email === email) ?? null;

export const buscarPorId = (idUsuario) => usuarios.find((u) => u.id_usuario === idUsuario) ?? null;
