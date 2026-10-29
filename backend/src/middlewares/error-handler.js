/**
 * Manejo centralizado de errores.
 *
 * Los servicios y middlewares lanzan un ApiError ("error esperado": datos inválidos, sin sesión,
 * sin permiso…) y Express 5 lo trae aquí, también desde funciones async. Ningún controlador arma
 * respuestas de error a mano: todas salen de este archivo con la misma forma
 *
 *   { success: false, status, message, code, fields }
 *
 * Al cliente se le cuenta QUÉ pasó, nunca el detalle técnico (stack, rutas del servidor).
 */
export class ApiError extends Error {
  constructor(status, message, { code = null, fields = null } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export const unauthorized = (message = 'Debes iniciar sesión.', code = 'UNAUTHORIZED') => new ApiError(401, message, { code });
export const forbidden = (message = 'No tienes permiso para realizar esta acción.') => new ApiError(403, message, { code: 'FORBIDDEN' });
export const noExiste = (label) => new ApiError(404, `${label} no existe.`, { code: 'NOT_FOUND' });

/** Ruta inexistente: 404 en JSON (y no la página HTML de Express). */
export function notFound(req, res, next) {
  next(new ApiError(404, `La ruta ${req.method} ${req.originalUrl.split('?')[0]} no existe.`, { code: 'ROUTE_NOT_FOUND' }));
}

// Express reconoce un manejador de errores porque recibe 4 parámetros.
export function errorHandler(error, req, res, next) {
  let apiError = error;
  if (!(error instanceof ApiError)) {
    if (error.type === 'entity.parse.failed') apiError = new ApiError(400, 'El cuerpo de la petición no es un JSON válido.', { code: 'BAD_JSON' });
    else {
      console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} →`, error);
      apiError = new ApiError(500, 'Ocurrió un error inesperado en el servidor.', { code: 'INTERNAL' });
    }
  }

  if (res.headersSent) return next(error);
  res.status(apiError.status).json({ success: false, status: apiError.status, message: apiError.message, code: apiError.code, fields: apiError.fields });
}
