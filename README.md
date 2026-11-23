# Proyecto Backend - Coderhouse (Pre-entrega 4)

Backend desarrollado con Node.js, Express y MongoDB para la Plataforma de Eventos e Inscripciones, refactorizando el sistema de autenticación mediante **Passport.js** para centralizar las estrategias de registro, login y validación de sesión con JWT almacenado en cookies `httpOnly`.

## Tecnologías Utilizadas
* **Node.js** & **Express**
* **MongoDB** & **Mongoose**
* **Passport.js** (`passport`, `passport-local`, `passport-jwt`)
* **Bcrypt** (Hasheo seguro de contraseñas)
* **JSON Web Token (JWT)** & **Cookie-Parser**

---

## Arquitectura de Autenticación Centralizada

Toda la lógica de estrategias se encuentra centralizada en `src/config/passport.config.js`, mientras que `src/app.js` únicamente inicializa Passport (`passport.initialize()`):

1. **Estrategia `register` (`passport-local`):** Valida campos obligatorios, verifica el formato del email, normaliza el correo, comprueba unicidad en MongoDB, hashea la contraseña con `bcrypt` y crea el usuario con rol `user` por defecto.
2. **Estrategia `login` (`passport-local`):** Verifica la existencia del usuario y compara la contraseña con `bcrypt`. Tras la autenticación exitosa, el controlador (`sessions.controller.js`) genera el JWT y configura la cookie `currentUser` (`httpOnly: true`).
3. **Estrategia `current` (`passport-jwt`):** Extrae el token desde la cookie `currentUser` mediante un extractor personalizado (`cookieExtractor`), verifica su firma y deja el payload decodificado (`id`, `email`, `role`) disponible en `req.user` sin exponer la contraseña.

### Preparación para Proveedores Externos
La arquitectura modular en `src/config/passport.config.js` queda preparada para incorporar futuras estrategias de autenticación externa (como **Google** o **GitHub** mediante OAuth2) agregando nuevas estrategias directamente en dicho archivo de configuración, sin necesidad de modificar `src/app.js` ni alterar la estructura base del servidor.

---

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`:

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `PORT` | Puerto en el que levanta el servidor Express | `3000` |
| `NODE_ENV` | Entorno de ejecución (`development` o `production`) | `development` |
| `MONGO_URL` | Cadena de conexión a MongoDB | `mongodb+srv://...` |
| `JWT_SECRET` | Clave secreta para firmar y verificar los tokens JWT | `clave_secreta_segura` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token JWT | `1h` |

---

## Instalación y Arranque

1. Clonar el repositorio.
2. Instalar dependencias con `npm install`.
3. Configurar el archivo `.env` a partir de `.env.example`.
4. Iniciar el servidor en modo desarrollo con `npm run dev`.

---

## Documentación de la API (Endpoints)

### 1. Registro de Usuario
* **Ruta:** `POST /api/sessions/register`
* **Middleware:** `passport.authenticate('register', { session: false })`
* **Descripción:** Registra un nuevo usuario en la base de datos sin devolver su contraseña.

**Ejemplo de Request (Body JSON):**
```json
{
  "first_name": "Rodrigo",
  "last_name": "Navas",
  "email": "rodrigo.passport@mail.com",
  "password": "Secreta123"
}

---

---

## Evidencias de Pruebas (Thunder Client)

### 1. Registro exitoso (`POST /api/sessions/register` - 201 Created)
![Evidencia 1](./evidencias/Captura%20de%20pantalla%202026-11-22%20204623.png)

### 2. Login exitoso (`POST /api/sessions/login` - 200 OK)
![Evidencia 2](./evidencias/Captura%20de%20pantalla%202026-11-22%20204722.png)

### 3. Cookie `currentUser` (`httpOnly`) generada en Login
![Evidencia 3](./evidencias/Captura%20de%20pantalla%202026-11-22%20204844.png)

### 4. Usuario actual autenticado (`GET /api/sessions/current` - 200 OK)
![Evidencia 4](./evidencias/Captura%20de%20pantalla%202026-11-22%20204945.png)

### 5. Logout y bloqueo posterior (`POST /logout` 200 OK ➔ `GET /current` 401 Unauthorized)
![Evidencia 5](./evidencias/Captura%20de%20pantalla%202026-11-22%20205043.png)

### 6. Caso 2: Registro con email duplicado (`409 Conflict`)
![Evidencia 6](./evidencias/Captura%20de%20pantalla%202026-11-22%20205354.png)

### 7. Caso 3: Login con credenciales inválidas (`401 Unauthorized`)
![Evidencia 7](./evidencias/Captura%20de%20pantalla%202026-11-22%20205555.png)

### 8. Caso 4: `GET /api/sessions/current` con token manipulado (`401 Unauthorized`)
![Evidencia 8](./evidencias/Captura%20de%20pantalla%202026-11-22%20210556.png)