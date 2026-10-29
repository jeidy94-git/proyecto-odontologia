# DentalCare · Backend

API REST en **Node.js + Express 5** organizada en capas, con autenticación **JWT** y permisos por rol.
Usa **repositorios con datos dummy en memoria** (`src/data/dummyData.js`), así que no necesita MySQL:
los datos son los mismos registros semilla de `database/dentalcare_bd_v2.sql`. Las citas nuevas y los
cambios de estado se pierden al reiniciar el servidor.

## Cómo ejecutar
```bash
cd backend
npm install
npm start          # http://localhost:3000/api   (npm run dev reinicia al guardar)
```
Variables de entorno opcionales: `PORT` (3000 por defecto) y `JWT_SECRET`. El secreto por defecto de
`src/config/env.js` es solo para desarrollo: en producción se define `JWT_SECRET` con un texto largo al azar.

## Arquitectura
```
src/
  server.js        arranque (solo listen)
  app.js           CORS → JSON → rutas → 404 → manejador de errores
  config/          env.js (puerto, secreto y duración del JWT: 8 h) · permisos.js (matriz rol → permisos)
  routes/          URL → middlewares → controlador
  middlewares/     auth.js (verifyToken, requirePermission) · error-handler.js (ApiError, 404, errores)
  controllers/     HTTP: lee la petición, llama al servicio y responde (código + JSON)
  services/        reglas de negocio: login, filtro por rol, RN-02 (agenda.js), estados de la cita
  repositories/    único acceso a los datos (dummy en memoria; se cambiaría por SQL sin tocar lo demás)
  data/            dummyData.js: usuarios, pacientes, especialistas con horarios, servicios y citas
```
Las llamadas van en un solo sentido: ruta → middleware → controlador → servicio → repositorio.

## Credenciales dummy

| Rol | Correo | Contraseña | Asociado a |
|---|---|---|---|
| ADMIN | `admin@dentalcare.com` | `Admin2026*` | Laura Gómez |
| ASISTENTE | `recepcion@dentalcare.com` | `Recep2026*` | Carlos Pérez |
| DOCTOR | `dr.roberto@dentalcare.com` | `DocRoberto2026*` | especialista 1 (Odontología General) |
| DOCTOR | `dra.sofia@dentalcare.com` | `DraSofia2026*` | especialista 2 (Ortodoncia) |
| DOCTOR | `dr.andres@dentalcare.com` | `DrAndres2026*` | especialista 3 (Endodoncia) |
| PACIENTE | `andres.galvis@gmail.com` | `AndresG2026*` | paciente 11 |
| PACIENTE | `carolina.villa@hotmail.com` | `CarolinaV2026*` | paciente 12 |

Las contraseñas se convierten a hash bcrypt al arrancar; el login nunca compara texto plano.

## Endpoints

Todas las rutas, salvo el login y la solicitud web, exigen el encabezado `Authorization: Bearer <token>`.
Las respuestas correctas tienen `success: true`; los errores responden
`{ success: false, status, message, code, fields }`.

| Método y ruta | Acceso | Descripción |
|---|---|---|
| `POST /api/auth/login` | Público | `{ email, password }` → `{ token, expiresIn: "8h", user }` |
| `POST /api/citas/solicitud-web` | Público | Modal "Agendar valoración" de `index.html`: `{ nombre, telefono, fecha: "AAAA-MM-DD", especialidad, sede }` → `201` con la solicitud en estado `PENDIENTE_LLAMADA`. No es una cita todavía: no ocupa franjas ni aplica RN-02; recepción llama al paciente y agenda la cita real en `POST /api/citas` |
| `GET /api/citas` | Token | Filtra según el rol: ADMIN y ASISTENTE ven todas, DOCTOR solo su agenda y PACIENTE solo las suyas. Filtros opcionales: `?estado=&desde=&hasta=&id_paciente=&id_especialista=` |
| `POST /api/citas` | `CREAR_CITA` | `{ id_paciente, id_especialista, id_servicio, fecha_hora: "AAAA-MM-DD HH:MM", motivo }`. Aplica validación y RN-02. El PACIENTE agenda solo para sí mismo y su cita queda `PENDIENTE_CONFIRMACION`; el personal la crea `PROGRAMADA` |
| `PATCH /api/citas/:id/estado` | Token (reglas en el servicio) | `{ estado }`: `PROGRAMADA` (confirmar: ADMIN o ASISTENTE), `COMPLETADA` (ADMIN o el DOCTOR de esa cita), `CANCELADA` (quien tenga `CANCELAR_CITA`; el paciente solo las suyas) |
| `GET /api/servicios` | Token | Catálogo de tratamientos (`?soloActivos=true`) |
| `GET /api/especialistas` | Token | Odontólogos con sus horarios (`?soloActivos=true`) |
| `GET /api/pacientes` | Token | ADMIN, ASISTENTE y DOCTOR ven todos (`?q=` busca por nombre, documento o correo); el PACIENTE solo su registro |

**Estados de una cita:** `PENDIENTE_CONFIRMACION → PROGRAMADA → COMPLETADA`, y desde cualquiera de
los dos primeros `→ CANCELADA`. Otra transición responde `409 INVALID_TRANSITION`.

**RN-02 (al agendar):** la cita debe caer en una franja de 30 minutos (`:00` o `:30`) dentro del
horario del odontólogo ese día, no puede estar en el pasado, la franja no puede estar ocupada por otra
cita activa del mismo odontólogo y el paciente no puede tener otra cita a esa hora. Las citas
canceladas liberan la franja.

| Código | Cuándo |
|---|---|
| 400 `VALIDATION` | Faltan datos o el formato es inválido (detalle por campo en `fields`) |
| 401 | Sin token, token alterado o vencido, o credenciales incorrectas |
| 403 `FORBIDDEN` | El rol no tiene permiso para esa acción |
| 404 | El paciente, odontólogo, tratamiento, cita o ruta no existe |
| 409 | `SLOT_TAKEN` (franja ocupada), `PATIENT_BUSY` o `INVALID_TRANSITION` |
| 422 | `NO_SCHEDULE` (fuera de horario), `PAST_SLOT` (hora pasada) |

**Horarios dummy:** Dr. Roberto: lunes a viernes, 08:00–12:00 y 14:00–18:00 · Dra. Sofía: martes y
jueves 08:00–14:00, sábado 08:00–12:00 · Dr. Andrés: miércoles y viernes 10:00–16:00.

## Probar en Postman
1. `POST http://localhost:3000/api/auth/login` con body JSON
   `{ "email": "recepcion@dentalcare.com", "password": "Recep2026*" }` y copiar el `token`.
2. En las demás peticiones: pestaña **Authorization** → tipo **Bearer Token** → pegar el token.
3. `GET http://localhost:3000/api/citas` devuelve las 10 citas precargadas.
4. Agendar (lunes 9 de noviembre de 2026, horario del Dr. Roberto):
   ```json
   POST http://localhost:3000/api/citas
   { "id_paciente": 13, "id_especialista": 1, "id_servicio": 2, "fecha_hora": "2026-11-09 09:30", "motivo": "Limpieza" }
   ```
   Repetir la misma petición responde `409 SLOT_TAKEN`; cambiar `id_especialista` a 2 responde
   `422 NO_SCHEDULE`, porque la Dra. Sofía no atiende los lunes.
5. Confirmar o cancelar: `PATCH http://localhost:3000/api/citas/5/estado` con `{ "estado": "PROGRAMADA" }`.
6. Iniciar sesión como `andres.galvis@gmail.com` y repetir el paso 3: el paciente solo ve sus 2 citas.
