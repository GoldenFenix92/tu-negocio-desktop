# Developer Guide — Tu Negocio Desktop

Guía técnica para desarrolladores que trabajan en este proyecto.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Desktop shell | Electron 39 |
| Frontend | React 18 + react-router-dom 7 |
| Bundler | Webpack 5 + Babel (presets env + react) |
| CSS | Tailwind CSS v3 + PostCSS + autoprefixer |
| Componentes UI | Preline UI + Ant Design v5 (ConfigProvider) |
| Sistema de temas | themeDesigns.js (10 temas, CSS custom properties dinámicas) |
| Gráficos | Recharts (BarChart, ResponsiveContainer) |
| Base de datos | SQLite (better-sqlite3) |
| Imágenes | sharp (conversión a WebP) |
| i18n | i18next + react-i18next |
| Iconos | lucide-react |
| Notificaciones | ToastContext (React Context) |
| Empaquetado | electron-builder (NSIS Windows) |
| Lenguaje | JavaScript (JSX), sin TypeScript |

---

## Dependencias principales

```json
// devDependencies
@babel/core, @babel/preset-env, @babel/preset-react
babel-loader, css-loader, style-loader
html-webpack-plugin, webpack, webpack-cli
electron, electron-builder
i18next, react, react-dom, react-i18next
node-abi, tar-fs                // postinstall rebuild script

// dependencies
antd                            // UI components (Table, Form, Modal, ConfigProvider)
autoprefixer                    // PostCSS vendor prefixes
bcryptjs                        // Password hashing (main process)
better-sqlite3                  // SQLite native module
lucide-react                    // Icon library
papaparse                       // CSV import
postcss, postcss-loader         // PostCSS pipeline for Tailwind
preline                         // UI component library (JS import only)
react-router-dom                // Client-side routing
recharts                        // Charts (daily sales, top products)
sharp                           // Image processing (WebP conversion)
tailwindcss                     // Utility-first CSS framework
```

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
│  ├── db/init-db (schema + seed)     │
│  ├── bcryptjs (hash/compare)        │
│  ├── sharp (WebP conversion)        │
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
│  ├── App.jsx (router, layout, theme)│
│  ├── Ant Design ConfigProvider      │
│  ├── ErrorBoundary                  │
│  ├── ToastProvider (notificaciones) │
│  ├── Componentes de negocio (POS)   │
│  ├── i18n (react-i18next)           │
│  ├── Tailwind CSS + Preline UI      │
│  └── window.api.* para IPC          │
└─────────────────────────────────────┘
```

### Seguridad

- `contextIsolation: true` — el renderer no accede directamente a Node.js
- `nodeIntegration: false` — no se requiere `require()` en el renderer
- `sandbox: true` — sandbox de Chromium activado
- IPC expuesto solo mediante `contextBridge` en `preload.js`
- DevTools solo en modo desarrollo (`!app.isPackaged`)
- Validación de archivos subidos (tamaño máx 5MB, solo imágenes)

---

## Base de datos

### Esquema (SQLite)

La base de datos se almacena en `data/tu_negocio.db` y se crea automáticamente al iniciar la app mediante `db/init-db.js`.

**Tablas:**

| Tabla | Propósito |
|---|---|
| `business_config` | Metadatos del negocio (no se usa — la config se guarda en JSON) |
| `users` | Autenticación (username, bcrypt hash, role) |
| `categories` | Categorías de productos |
| `products` | Productos (code, name, price, cost, stock, FK → categories) |
| `clients` | Clientes (name, email, phone, address) |
| `sales` | Ventas (FK → users, clients) |
| `sale_items` | Items por venta (FK → sales, products) |
| `coupons` | Cupones de descuento |
| `promotions` | Promociones por temporada |
| `sections_visibility` | Visibilidad de secciones por rol |

**Índices:** Creados automáticamente en `products(category_id)`, `products(code)`, `sales(user_id)`, `sales(client_id)`, `sales(created_at)`, `sale_items(sale_id)`, `sale_items(product_id)`, `coupons(code)`.

### Transacciones

Las ventas se procesan dentro de una transacción atómica (`dbTransaction`) que agrupa: INSERT en `sales`, INSERT en `sale_items` y UPDATE de stock. Si falla cualquier paso, todo se revierte.

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

## Tailwind CSS + PostCSS

El proyecto usa **Tailwind CSS v3** con **PostCSS**. La configuración está en:

- `tailwind.config.js` — dark mode vía `selector` (clase `.dark`), fuentes Inter y JetBrains Mono
- `postcss.config.js` — plugins: `tailwindcss` + `autoprefixer`

El pipeline de Webpack es: `style-loader ← css-loader ← postcss-loader`

Las directivas `@tailwind` se declaran en `src/App.css`.

### CSS Custom Properties (sistema de temas)

El proyecto define y actualiza dinámicamente variables CSS en `<html>` mediante `themeDesigns.js`:

| Variable | Propósito |
|---|---|
| `--color-primary` | Color de acento principal |
| `--color-surface` | Fondo principal de paneles |
| `--color-surface-secondary` | Fondo secundario (tarjetas, inputs) |
| `--color-on-surface` | Color de texto principal |
| `--color-on-surface-secondary` | Color de texto secundario |
| `--bg-gradient` | Gradient decorativo de fondo (dark themes) |
| `--bg-primary` | Alias de `--color-surface` (legacy) |
| `--bg-secondary` | Alias de `--color-surface-secondary` (legacy) |
| `--text-primary` | Alias de `--color-on-surface` (legacy) |
| `--text-secondary` | Alias de `--color-on-surface-secondary` (legacy) |

Cada variable también tiene su variante `--*-rgb` con valores RGB separados por coma para usar en `rgba()` o `color-mix()`.

---

## Sistema de temas (Theme Design System)

El proyecto reemplazó el simple toggle claro/oscuro por un sistema de **10 temas visuales** (5 claros + 5 oscuros) definidos en `src/themeDesigns.js`.

### Cómo funciona

```js
// themeDesigns.js — exporta:
themeDesigns          // objeto { id → design }
getDesign(id)         // obtiene un diseño por ID
resolveDesign(mode, designId)  // resuelve modo+ID → diseño válido
getDesignsForMode(mode)        // lista de diseños para light/dark
applyDesignCSS(design)         // aplica colores como CSS custom properties en :root
applyInitialTheme()            // restaura tema desde localStorage al cargar
```

### Flujo de aplicación

1. El usuario selecciona un `themeMode` (`light` | `dark` | `system`) y un `themeDesign` (ID del diseño).
2. Ambos se persisten en `localStorage` (`theme` y `themeDesign`).
3. `resolveDesign()` determina el diseño activo según el modo y el diseño guardado, cambiando automáticamente al diseño por defecto del modo contrario si es necesario.
4. `applyDesignCSS()` escribe las variables CSS en `<html>` (colores, RGBs, gradient).
5. Se sincroniza `data-theme` y `class="dark"` en `<html>` para compatibilidad con Tailwind y Ant Design.

### CSS y compatibilidad

- **Tailwind** usa la clase `.dark` en `<html>` para `dark:` variants.
- **Ant Design** usa `ConfigProvider` con `darkAlgorithm` / `defaultAlgorithm`.
- **CSS personalizado** usa variables `--color-*` que se actualizan dinámicamente.
- **Componentes heredados** que usan `--bg-primary`, `--text-primary` etc. siguen funcionando porque `applyDesignCSS()` los escribe como alias.
- El gradient de fondo (`--bg-gradient`) se aplica solo en temas oscuros como `radial-gradient`.

### Temas disponibles

| ID | Nombre | Modo | Acento |
|---|---|---|---|
| `light-default` | Claro Azul | light | `#2563eb` |
| `light-warm` | Claro Dorado | light | `#d97706` |
| `light-rose` | Rosa Vibrante | light | `#e11d48` |
| `light-slate` | Pizarra Teal | light | `#0f766e` |
| `light-lavender` | Lavanda | light | `#7c3aed` |
| `dark-default` | Oscuro Bosque | dark | `#22c55e` |
| `dark-midnight` | Oscuro Océano | dark | `#0ea5e9` |
| `dark-cyberpunk` | Cyberpunk Neón | dark | `#f43f5e` |
| `dark-matrix` | Matrix Esmeralda | dark | `#10b981` |
| `dark-ember` | Oscuro Ámbar | dark | `#f97316` |

### Legacy

Las variables antiguas (`--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`) se mantienen como alias en `applyDesignCSS()` para compatibilidad con componentes CSS que aún no migraron al sistema `--color-*`.

---

## Flujo de trabajo típico

```bash
# 1. Instalar dependencias (recompila módulos nativos automáticamente)
npm install

# 2. Compilar y ejecutar en desarrollo
npm run dev

# 3. Empaquetar para distribución (Windows)
npm run build  # genera .exe en dist-electron/
```

Si la recompilación automática de `better-sqlite3` falla:

```bash
npx @electron/rebuild -m . -o better-sqlite3
```

El script `postinstall` (`scripts/rebuild-native.js`) intenta primero descargar un prebuilt desde GitHub, y si falla ejecuta `@electron/rebuild` como respaldo.

---

## Variables de entorno

No se requieren variables de entorno. Toda la configuración se maneja mediante archivos JSON en `config/`.

---

## Sistema de notificaciones (Toast)

Creado con React Context. Cualquier componente puede mostrar un toast:

```jsx
import { useToast } from '../ToastContext';

function MiComponente() {
  const showToast = useToast();
  showToast('Mensaje', 'success'); // success | error | warning | info
}
```

Los toasts se auto-destruyen después de 3 segundos y se apilan en la esquina superior derecha.

---

## Utilitarios compartidos (`src/utils.js`)

```js
getMediaUrl(path, fallback)    // Construye URL media:// consistente
getUserAvatar(user)            // Obtiene avatar según rol del usuario
```

---

## Protección de rutas

Las rutas se protegen mediante `<ProtectedRoute allowedRoles={[...]}>`. Si el usuario no tiene el rol requerido, es redirigido al Dashboard. La Sidebar también filtra las opciones de menú por rol.

---

## Atajos de teclado (SalesScreen)

| Tecla | Acción |
|-------|--------|
| `F2` | Enfocar búsqueda |
| `F4` | Finalizar venta |
| `Escape` | Cerrar modal |

Los scanners de código de barras se detectan por buffer rápido de teclado (caracteres en <50ms seguido de Enter).

---

## Internacionalización (i18n)

- Archivos de traducción en `src/locales/{es,en}/translation.json`
- Se usa `react-i18next` con `i18next`
- Idioma por defecto: español
- El idioma se persiste en `localStorage`
- El atributo `<html lang>` se actualiza dinámicamente

---

## Temas (Theme Design System)

- 10 temas visuales (5 claros + 5 oscuros) definidos en `src/themeDesigns.js`
- Cada tema define 5 colores base: `primary`, `surface`, `surface-secondary`, `on-surface`, `on-surface-secondary`
- Se aplican como CSS custom properties dinámicas en `<html>` mediante `applyDesignCSS()`
- El usuario selecciona un modo (`light`/`dark`/`system`) y un diseño específico
- Persistencia en `localStorage` bajo las claves `theme` y `themeDesign`
- Los gradientes decorativos de fondo se activan solo en temas oscuros
- Ant Design se sincroniza vía `ConfigProvider` con `theme.darkAlgorithm` / `defaultAlgorithm`

---

## Módulos nativos y Electron

`better-sqlite3` y `sharp` son módulos nativos que deben compilarse contra la versión de Node.js incluida en Electron. Si al ejecutar la app aparece un error como:

```
The module was compiled against a different Node.js version
```

Ejecutar:

```bash
npx @electron/rebuild -m . -o better-sqlite3
npx @electron/rebuild -m . -o sharp
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

Ver `package.json` → sección `"build"`. Actualmente configurado solo para Windows (NSIS).

Para agregar soporte macOS o Linux:

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
