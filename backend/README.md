# GemQuest Backend

API REST con Express.js, Prisma ORM y PostgreSQL (Neon).

## Requisitos

- Node.js 20+
- Base de datos PostgreSQL en [Neon](https://neon.tech)

## Configuración

1. Copia el archivo de entorno:

```bash
cp .env.example .env
```

2. En Neon, copia la **connection string** y pégala en `DATABASE_URL` dentro de `.env`.

3. Genera un `JWT_SECRET` seguro (cadena larga aleatoria).

4. Instala dependencias y prepara la base de datos:

```bash
npm install
npm run db:setup
```

`db:setup` ejecuta: `prisma generate` → `prisma db push` → `seed` de los 3 niveles.

## Desarrollo

```bash
npm run dev
```

La API quedará en `http://localhost:3001`.

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | No | Estado del servidor |
| POST | `/api/auth/register` | No | Registrar jugador |
| POST | `/api/auth/login` | No | Iniciar sesión |
| GET | `/api/auth/me` | Sí | Perfil del jugador |
| GET | `/api/progress` | Sí | Progreso y mejores puntajes |
| POST | `/api/progress/level-result` | Sí | Guardar resultado de partida |
| GET | `/api/progress/levels` | No | Listar niveles desde BD |

## Modelo de datos

- `jugadores` — usuarios del juego
- `niveles` — configuración de los 3 niveles
- `progreso` — nivel desbloqueado por jugador
- `progreso_nivel` — mejor puntaje y completado por nivel
- `partidas` — historial de partidas
