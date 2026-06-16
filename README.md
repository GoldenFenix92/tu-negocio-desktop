# Tu Negocio Desktop

Aplicación POS (Point of Sale) de escritorio para la gestión integral de pequeños y medianos negocios. Construida con **Electron 39**, **React 18** y **SQLite**.

---

## Características

- **Punto de venta** — Registro de ventas con búsqueda de productos, carrito, cupones, selección de cliente y método de pago (efectivo/tarjeta/transferencia). Atajos de teclado: F2 (buscar), F4 (finalizar), Escape (cerrar). Soporte para scanner de código de barras.
- **Historial de ventas** — Consulta de ventas realizadas con filtro por fechas y detalle de productos.
- **Dashboard** — 6 KPIs: ventas hoy, ventas últimos 7 días, ventas del mes, productos en catálogo, stock bajo, cantidad de clientes.
- **Gestión de inventario** — CRUD de productos y categorías, importación CSV con UPSERT.
- **Clientes** — Base de datos de clientes con foto y datos de contacto.
- **Cupones y promociones** — Descuentos por porcentaje o monto fijo, con fecha de expiración.
- **Reportes** — Gráficos de ventas diarias (últimos 7 días) y top 5 productos más vendidos con Recharts.
- **Roles y permisos** — Administrador, Supervisor y Cajero; rutas protegidas por rol.
- **Temas visuales** — 10 diseños predefinidos (5 claros + 5 oscuros): Azul/Dorado/Rosa/Teal/Lavanda en claro, Bosque/Océano/Cyberpunk/Matrix/Ámbar en oscuro. Paletas con acentos vibrantes y contraste optimizado. Los modales usan formularios en grid horizontal para mejor aprovechamiento del ancho.
- **Internacionalización** — Español e inglés (react-i18next).
- **Logo con versión Light/Dark** — El negocio puede tener logos distintos para cada tema.
- **Favicon personalizado** — Con fallback al icono por defecto.
- **Notificaciones Toast** — Feedback visual no bloqueante para todas las operaciones.
- **Configuración en vivo** — Los cambios en Settings se aplican al instante sin reiniciar la app (logo, tipografía, nombre).
- **Conversión WebP** — Las imágenes subidas se convierten automáticamente a WebP para optimizar almacenamiento.
- **Datos de prueba** — La primera ejecución siembra la BD con 40 productos, 12 clientes, 25 ventas, cupones y promociones.
- **Base de datos local** — SQLite, sin necesidad de servidores externos.
- **UI moderna** — Tailwind CSS + Preline UI + Ant Design v5, diseño responsive con glassmorphism y gradientes.

---

## Requisitos

- **Node.js** v18 o superior
- **npm** (incluido con Node.js)
- **Windows Build Tools** (Python 3 + Visual Studio Build Tools) para compilar módulos nativos

---

## Instalación y ejecución

```bash
# Clonar el repositorio
git clone <repo-url>
cd tu-negocio-desktop

# Instalar dependencias (también recompila módulos nativos para Electron)
npm install

# Iniciar en modo desarrollo
npm run dev
```

La primera vez que se ejecuta, crea automáticamente la base de datos `data/tu_negocio.db` con los siguientes usuarios por defecto:

| Usuario      | Contraseña   | Rol            |
|--------------|-------------|----------------|
| `admin`      | `admin`     | Administrator  |
| `supervisor` | `supervisor`| Supervisor     |
| `cajero`     | `cajero`    | Cashier        |

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Ejecuta la app con el build existente en `dist/` |
| `npm run dev` | Compila con webpack (dev) y lanza Electron |
| `npm run build` | Compila en producción y empaqueta con electron-builder (instalador .exe) |

---

## Atajos de teclado (Pantalla de ventas)

| Tecla | Acción |
|-------|--------|
| `F2` | Enfocar búsqueda de productos |
| `F4` | Finalizar venta |
| `Escape` | Cerrar modal |

Los scanners de código de barras son detectados automáticamente (buffer rápido + Enter).

---

## Estructura del proyecto

```
tu-negocio-desktop/
├── main.js                 # Proceso principal de Electron
├── preload.js              # Puente seguro (IPC) entre main y renderer
├── webpack.config.js       # Configuración de Webpack + PostCSS
├── tailwind.config.js      # Configuración de Tailwind CSS (colores, dark mode)
├── postcss.config.js       # Plugins de PostCSS (Tailwind, autoprefixer)
├── .babelrc                # Configuración de Babel (presets env + react)
├── config/
│   ├── businessConfig.json # Configuración del negocio (logo, nombre, etc.)
│   └── dbConfig.json       # Ruta de la base de datos SQLite
├── db/
│   ├── sqlite.js           # Conector a SQLite
│   ├── init-db.js          # Inicialización de la BD con schema
│   ├── seed.js             # Datos de prueba (40 productos, ventas, etc.)
│   └── schema.sql          # Esquema de referencia (MySQL original)
├── src/                    # Código fuente React
│   ├── index.js            # Entry point de React + import Preline
│   ├── App.jsx             # Componente principal (router, layout, theme, i18n)
│   ├── App.css             # Tailwind directives + CSS variables + modales/toasts
│   ├── themeDesigns.js     # 10 temas visuales (colores, gradientes, aplicación dinámica)
│   ├── Settings.jsx        # Configuración del negocio (logo, favicon, etc.)
│   ├── Settings.css
│   ├── ToastContext.jsx    # Sistema de notificaciones Toast
│   ├── utils.js            # Funciones utilitarias compartidas
│   ├── i18n.js             # Configuración de i18next
│   ├── components/
│   │   ├── Login.jsx / .css       # Pantalla de login con glassmorphism
│   │   ├── Dashboard.jsx          # 6 KPIs con gradientes y loading spinner
│   │   ├── Sidebar.jsx / .css     # Navegación con roles, avatar, dark mode
│   │   ├── SalesScreen.jsx / .css # Punto de venta con carrito y checkout
│   │   ├── SalesHistory.jsx       # Historial de ventas con split layout
│   │   ├── ProductManagement.jsx / .css
│   │   ├── Categories.jsx / .css
│   │   ├── Clients.jsx / .css
│   │   ├── Coupons.jsx / .css
│   │   ├── Reports.jsx / .css     # Gráficos con Recharts
│   │   ├── Permissions.jsx / .css
│   │   ├── ImportModal.jsx / .css
│   │   ├── UserProfile.jsx / .css
│   │   ├── ProtectedRoute.jsx     # Guard de rutas por rol
│   │   ├── ErrorBoundary.jsx      # Captura de errores de React
│   │   ├── ConfirmModal.jsx
│   │   └── SetupWizard.jsx / .css # Configuración inicial del negocio
│   └── locales/           # Traducciones (es/en)
├── assets/                 # Imágenes estáticas
├── scripts/
│   └── rebuild-native.js   # Recompila better-sqlite3 para Electron
└── opencode.json           # Configuración del asistente opencode
```

---

## Licencia

MIT
