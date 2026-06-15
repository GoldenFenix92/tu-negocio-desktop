# Developer Guide — Tu Negocio Desktop

Guía técnica para desarrolladores que trabajan en este proyecto.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Desktop shell | Electron 39 |
| Frontend | React 18 + react-router-dom 7 |
| Bundler | Webpack 5 + Babel |
| Base de datos | SQLite (better-sqlite3) |
| Estilos | CSS (style-loader + css-loader) |
| i18n | i18next + react-i18next |
| Iconos | lucide-react |
| Empaquetado | electron-builder (NSIS Windows) |
| Lenguaje | JavaScript (JSX), sin TypeScript |

---

## Arquitectura

### Modelo de procesos de Electron

```
┌─────────────────────────────────────┐
│          Main Process               │
│  (main.js)                          │
│  ├── Ventana Electron               │
│  ├── Handlers IPC                   │
│  ├── db/sqlite.js (queries)         │
│  ├── bcryptjs (hash/compare)        │
│  ├── Protocolo media://             │
│  └── fs (config file I/O)          │
└────────────┬────────────────────────┘
             │ IPC (contextBridge)
             ▼
┌─────────────────────────────────────┐
│        Preload Script               │
│  (preload.js)                       │
│  ├── contextBridge.exposeInMainWorld│
│  └── window.api.* expuesto          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│        Renderer Process             │
│  (React SPA en dist/index.html)     │
│  ├── App.jsx (router, layout)       │
│  ├── Componentes de negocio         │
│  ├── i18n (react-i18next)           │
│  └── window.api.* para IPC          │
└─────────────────────────────────────┘
```

### Seguridad

- `contextIsolation: true` — el renderer no accede directamente a Node.js
- `nodeIntegration: false` — no se requiere `require()` en el renderer
- `sandbox: true` — sandbox de Chromium activado
- IPC expuesto solo mediante `contextBridge` en `preload.js`

---

## Base de datos

### Esquema (SQLite)

La base de datos se almacena en `data/tu_negocio.db` y se crea automáticamente al iniciar la app mediante `db/init-db.js`.

**Tablas:**

| Tabla | Propósito |
|---|---|
| `business_config` | Metadatos del negocio (no se usa actualmente — la config se guarda en JSON) |
| `users` | Autenticación (username, bcrypt hash, role) |
| `categories` | Categorías de productos |
| `products` | Productos (code, name, price, cost, stock, FK → categories) |
| `clients` | Clientes (name, email, phone, address) |
| `sales` | Ventas (FK → users, clients) |
| `sale_items` | Items por venta (FK → sales, products) |
| `coupons` | Cupones de descuento |
| `promotions` | Promociones por temporada |
| `sections_visibility` | Visibilidad de secciones por rol |

### Migración de MySQL a SQLite

El proyecto original usaba MySQL. Se migró a SQLite para facilitar el desarrollo local sin dependencias externas. El archivo `db/schema.sql` contiene el esquema MySQL original como referencia. La implementación activa está en `db/init-db.js`.

---

## Configuración del negocio

Los datos del negocio se almacenan en `config/businessConfig.json` con esta estructura:

```json
{
  "businessName": "Mi Negocio",
  "logoLightPath": "/ruta/al/logo-light.png",
  "logoDarkPath": "/ruta/al/logo-dark.png",
  "hasThemeLogos": false,
  "faviconPath": "/ruta/al/favicon.ico",
  "address": "Dirección",
  "phone": "Teléfono",
  "typography": "Montserrat"
}
```

El logo se renderiza mediante el protocolo personalizado `media://`. Este protocolo (registrado en `main.js`) intercepta URLs con prefijo `media://` y sirve archivos locales del sistema de archivos.

---

## Flujo de trabajo típico

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar y ejecutar en desarrollo
npm run dev

# 3. Empaquetar para distribución (Windows)
npm run build  # genera .exe en dist-electron/
```

Si se agregan nuevos módulos nativos (como `better-sqlite3`), deben recompilarse para la versión de Node.js que usa Electron:

```bash
npx @electron/rebuild -m . -o <modulo>
```

El script `postinstall` ya ejecuta esto automáticamente para `better-sqlite3`.

---

## Variables de entorno

No se requieren variables de entorno. Toda la configuración se maneja mediante archivos JSON en `config/`.

---

## Internacionalización (i18n)

- Archivos de traducción en `src/locales/{es,en}/translation.json`
- Se usa `react-i18next` con `i18next`
- Idioma por defecto: español
- El idioma se persiste en `localStorage`

## Temas (claro/oscuro)

- Tres modos: `light`, `dark`, `system` (sigue la preferencia del SO)
- Se aplica mediante el atributo `data-theme` en `<html>`
- Se persiste en `localStorage`
- Los estilos usan variables CSS personalizadas (`var(--primary-color)`, etc.)

---

## Módulos nativos y Electron

`better-sqlite3` es un módulo nativo que debe compilarse contra la versión de Node.js incluida en Electron. Si al ejecutar la app aparece un error como:

```
The module was compiled against a different Node.js version
```

Ejecutar:

```bash
npx @electron/rebuild -m . -o better-sqlite3
```

O simplemente reinstalar:

```bash
npm install
```

---

## Empaquetado (Build)

```bash
npm run build
```

Esto ejecuta:
1. `webpack --mode production` — compila el bundle optimizado en `dist/`
2. `electron-builder` — empaqueta la app en un instalador NSIS en `dist-electron/`

### Configuración de electron-builder

Ver `package.json` → sección `"build"`. Actualmente está configurado solo para Windows (NSIS).

Para agregar soporte macOS o Linux, añadir las secciones correspondientes en `package.json`:

```json
"mac": { "target": "dmg" },
"linux": { "target": "AppImage" }
```

---

## Pruebas

Actualmente no hay un framework de testing configurado. Se recomienda agregar pruebas unitarias con Jest y pruebas de componentes con React Testing Library.

---

## Vulnerabilidades

Para auditar y corregir vulnerabilidades de dependencias:

```bash
npm audit
npm audit fix        # correcciones automáticas no-breaking
npm audit fix --force  # corrige todo (puede incluir breaking changes)
```
