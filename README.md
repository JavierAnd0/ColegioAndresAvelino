# Colegio Andrés Avelino — Sitio Web Institucional

Sitio web completo para institución educativa con página pública y panel CMS para administración de contenido escolar.

---

## Tecnologías

### Frontend
- **Next.js 16** + **React 19** (App Router)
- **Tailwind CSS v4** + Iconify
- **Axios** (capa de servicios API)
- **React Hook Form**, **date-fns**, **EmailJS**
- **Biome** (linter/formatter)
- **Sentry** + Vercel Analytics

### Backend
- **Express.js** (ES Modules)
- **MongoDB** + **Mongoose**
- **JWT** para autenticación
- **Cloudinary** (imágenes)
- **Multer**, **Helmet**, **express-rate-limit**
- **node-cron** (tareas programadas)
- **Jest** + `mongodb-memory-server` (tests)

---

## Estructura del repositorio

```
ColegioAndresAvelino/
├── colegio-frontend/     # Next.js (puerto 3000)
└── colegio-backend/      # Express API REST (puerto 5000)
```

---

## Instalación y ejecución

### Requisitos
- Node.js 20+
- MongoDB (local o Atlas)
- Cuenta en Cloudinary

### Backend

```bash
cd colegio-backend
npm install
cp .env.example .env   # completar variables (ver sección Variables de entorno)
npm run dev            # modo desarrollo con nodemon
```

### Frontend

```bash
cd colegio-frontend
npm install
cp .env.local.example .env.local   # completar variables
npm run dev                         # http://localhost:3000
```

### Seed inicial de datos

```bash
cd colegio-backend
npm run seed        # carga datos de prueba
npm run reset-admin # restablece credenciales del superadmin
```

---

## Variables de entorno

### Backend (`colegio-backend/.env`)

| Variable | Descripción |
|---|---|
| `NODE_ENV` | `development` / `production` |
| `PORT` | Puerto del servidor (default: 5000) |
| `MONGODB_URI` | URI de conexión MongoDB |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT (mín. 64 bytes) |
| `JWT_EXPIRE` | Duración del token (ej. `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |
| `CORS_ORIGINS` | Orígenes permitidos separados por coma |
| `FRONTEND_URL` | URL del frontend (para emails de reset) |
| `SUPERADMIN_EMAIL` | Email del superadmin inicial |
| `SUPERADMIN_PASSWORD` | Contraseña del superadmin inicial |
| `PEXELS_API_KEY` | *(Opcional)* Clave Pexels para imágenes automáticas |

### Frontend (`colegio-frontend/.env.local`)

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend (default: `http://localhost:5000/api`) |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | ID del servicio EmailJS |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Clave pública EmailJS |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | ID plantilla formulario de contacto |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_RESET_ID` | ID plantilla reset de contraseña |

---

## API REST

**Base URL:** `http://localhost:5000/api`

| Recurso | Ruta |
|---|---|
| Autenticación | `/api/auth` |
| Eventos | `/api/events` |
| Blog | `/api/blog` |
| Actividades | `/api/activities` |
| Docentes | `/api/teachers` |
| Grados | `/api/grades` |
| Cuadro de honor | `/api/honor` |
| Carrusel | `/api/carousel` |
| Hero | `/api/hero` y `/api/hero-slides` |
| Subida de archivos | `/api/upload` |

Las rutas protegidas requieren header `Authorization: Bearer <token>`.

---

## Panel de administración

Acceso en `/admin/login`. Roles disponibles: `superadmin` y `admin`.

| Sección | Descripción |
|---|---|
| **Actividades** | CRUD de actividades escolares con estado y prioridad |
| **Blog** | Publicación de entradas con borradores, SEO y imagen destacada |
| **Eventos** | Calendario de eventos con categorías y colores |
| **Docentes** | Directorio de profesores con foto y materias |
| **Grados** | Gestión de cursos y asignación de docentes |
| **Cuadro de honor** | Registro de logros estudiantiles |
| **Carrusel / Hero** | Gestión de imágenes del banner principal |
| **Usuarios** | Alta y gestión de administradores |

---

## Comandos útiles

### Frontend

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run lint      # Biome check
npm run format    # Biome format --write
```

### Backend

```bash
npm run dev           # Nodemon (watch mode)
npm start             # Producción
npm test              # Jest (MongoDB en memoria)
npm run test:verbose  # Tests con detalle
npm run seed          # Datos de prueba
npm run reset-admin   # Restablecer superadmin
```

### Ejecutar un test específico

```bash
cd colegio-backend
NODE_OPTIONS='--experimental-vm-modules' jest tests/ruta/al/archivo.test.js --forceExit
```

---

## Seguridad

- Contraseñas hasheadas con **bcryptjs** (10 rounds)
- Tokens JWT con expiración configurable
- Rate limiting en el endpoint de login
- Headers HTTP seguros con **Helmet**
- Validación de inputs en todas las rutas
- CORS restringido a orígenes configurados
- Tokens de reset de contraseña con expiración de 10 minutos
- Imágenes servidas vía **Cloudinary CDN**

---

## Licencia

ISC
