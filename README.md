# Payload Vue Ecommerce

Monorepo de ecommerce: **Payload CMS 3** (backend / admin / API) y **Vue 3** (storefront).

Este documento describe solo el backend. El frontend se documentará más adelante.

## Qué hace el backend

El backend vive en `backend/` y está basado en el [template ecommerce de Payload](https://github.com/payloadcms/payload/tree/main/templates/ecommerce).

Es una app **Next.js** que incluye:

- Panel de administración en `/admin`
- API REST y GraphQL de Payload
- Lógica de tienda: productos, carritos, pedidos y pagos con Stripe
- Un storefront React de referencia (el de la plantilla). El storefront definitivo será Vue.

La fuente de verdad del contenido y del catálogo es Payload. Vue (u otro cliente) consume la API.

```
Cliente (Vue / admin / scripts)
        │
        ▼
   Next.js :3000
        │
        ├── /admin          → panel Payload
        ├── /api/*          → REST
        ├── /api/graphql    → GraphQL
        └── resto de rutas  → storefront Next (plantilla)
        │
        ▼
   PostgreSQL :5432
```

## Stack

| Pieza | Tecnología |
| --- | --- |
| CMS / API | Payload 3.87 |
| Framework | Next.js 16 |
| Base de datos | PostgreSQL 16 (`@payloadcms/db-postgres`) |
| Pagos | Stripe (`@payloadcms/plugin-ecommerce`) |
| Editor de texto | Lexical |
| Contenedores | Docker Compose |

Configuración principal: `backend/src/payload.config.ts`.

## Modelo de datos

### Colecciones propias

Definidas en `backend/src/collections/`:

| Colección | Rol |
| --- | --- |
| `users` | Auth. Roles `admin` (panel) y `customer` (tienda). El primer usuario creado se convierte en admin. |
| `pages` | Páginas con layout por bloques (hero, contenido, media, CTA, archive, etc.) y borradores. |
| `media` | Uploads (imágenes y otros archivos). Disco: `backend/public/media`. |
| `categories` | Taxonomía para agrupar productos. |

### Colecciones del plugin ecommerce

Las añade `@payloadcms/plugin-ecommerce` (ver `backend/src/plugins/index.ts`):

| Colección | Rol |
| --- | --- |
| `products` / `variants` | Catálogo, precios por moneda y variantes. |
| `carts` | Carrito de cliente o invitado. |
| `addresses` | Direcciones guardadas para checkout. |
| `orders` | Pedido tras un pago exitoso. Incluye `accessToken` para consulta de invitados. |
| `transactions` | Ciclo de vida del pago (interno). |

### Globals

- `header` — navegación del sitio
- `footer` — pie de página

## Acceso

- **Admin:** entra al panel y edita contenido. Solo usuarios con rol `admin`.
- **Customer:** cuenta de tienda. Ve sus pedidos, direcciones y carrito.
- **Público:** páginas y productos publicados.
- **Invitados:** pueden comprar sin cuenta. Reciben un `accessToken` (por email) para consultar el pedido sin enumerar IDs.

Detalle de reglas en `backend/src/access/`.

## Pagos (Stripe)

El plugin ecommerce usa el adapter de Stripe. Variables:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOKS_SIGNING_SECRET`

En local, para recibir webhooks:

```bash
cd backend
npm run stripe-webhooks
```

Eso reenvía eventos a `http://localhost:3000/api/payments/stripe/webhooks`.

## Cómo levantarlo

Requisitos: Docker y Docker Compose.

Desde la raíz del repo:

```bash
docker compose up --build
```

Servicios:

| Servicio | Puerto | Descripción |
| --- | --- | --- |
| `postgres` | 5432 | Base de datos |
| `payload` | 3000 | Backend + admin + API |
| `frontend` | 5173 | Vue (fuera del alcance de este README) |

Al arrancar por primera vez:

1. Abre [http://localhost:3000/admin](http://localhost:3000/admin)
2. Crea el primer usuario (quedará como `admin`)
3. Desde el admin puedes sembrar datos de demo si la plantilla lo ofrece en el dashboard

El contenedor de Payload monta `./backend` y recarga cambios en caliente (`npm run dev` escucha en `0.0.0.0`).

### Solo backend, sin Docker

Hace falta PostgreSQL accesible y un `backend/.env` válido:

```bash
cd backend
cp .env.example .env   # ajustar DATABASE_URL a Postgres
npm install
npm run dev
```

`DATABASE_URL` debe apuntar a Postgres, por ejemplo:

```env
DATABASE_URL=postgres://payload_user:payload_password@localhost:5432/payload_ecommerce
```

> El `.env.example` de la plantilla aún menciona MongoDB. Este proyecto usa **PostgreSQL**.

## Variables de entorno

Archivo: `backend/.env` (no se sube a Git). Plantilla: `backend/.env.example`.

| Variable | Uso |
| --- | --- |
| `PAYLOAD_SECRET` | Firma de tokens y sesiones. Obligatoria y distinta en cada entorno. |
| `DATABASE_URL` | Connection string de Postgres. Es la que lee `payload.config.ts`. |
| `PAYLOAD_PUBLIC_SERVER_URL` | URL pública del servidor Payload. |
| `NEXT_PUBLIC_SERVER_URL` | URL pública de Next (imágenes, redirects, SEO). |
| `PREVIEW_SECRET` | Preview de borradores. |
| `STRIPE_*` | Claves y signing secret de Stripe. |
| `COMPANY_NAME`, `SITE_NAME`, `TWITTER_*` | Metadatos SEO / sitio. |

Compose inyecta `PAYLOAD_SECRET` y la URL pública. Next/Payload también cargan `backend/.env` (montado en el contenedor).

## API

Base: `http://localhost:3000`

| Recurso | URL |
| --- | --- |
| Admin | `/admin` |
| REST | `/api/{colección}` — p. ej. `/api/products`, `/api/pages` |
| GraphQL | `/api/graphql` |
| Playground GraphQL | `/api/graphql-playground` |
| Archivos de media | `/api/media/file/...` |

Ejemplos:

```bash
# Productos publicados
curl http://localhost:3000/api/products

# Páginas
curl http://localhost:3000/api/pages?where[_status][equals]=published
```

Auth de clientes: endpoints estándar de Payload sobre `users` (`/api/users/login`, `/api/users/me`, etc.).

Tipos TypeScript generados: `backend/src/payload-types.ts`. Tras cambiar colecciones:

```bash
cd backend
npm run generate:types
```

## Scripts útiles (`backend/`)

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Next en desarrollo (`0.0.0.0:3000`) |
| `npm run build` / `npm start` | Build y arranque de producción |
| `npm run generate:types` | Regenera `payload-types.ts` |
| `npm run generate:importmap` | Regenera el import map del admin |
| `npm run stripe-webhooks` | Túnel local de webhooks Stripe |
| `npm test` | Tests de integración + e2e |

## Estructura relevante

```
backend/
├── src/
│   ├── payload.config.ts    # config Payload (DB, editor, secret)
│   ├── plugins/index.ts     # ecommerce, SEO, formularios, Stripe
│   ├── collections/         # users, pages, media, categories, products
│   ├── globals/             # header, footer
│   ├── access/              # reglas de acceso
│   ├── app/
│   │   ├── (payload)/       # admin + API
│   │   └── (app)/           # storefront Next de la plantilla
│   └── payload-types.ts     # tipos generados
├── Dockerfile.dev
└── .env.example
```

## Próximos pasos de documentación

- Cómo consume Vue la API de Payload
- Variables `VITE_*` del frontend
- Flujo de checkout desde el storefront Vue
