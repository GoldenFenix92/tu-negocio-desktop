# Tu Negocio Desktop

Aplicación POS (Point of Sale) de escritorio para la gestión integral de pequeños y medianos negocios. Construida con **Electron**, **React** y **SQLite**.

---

## Características

- **Punto de venta** — Registro de ventas con búsqueda de productos, carrito, cupones, selección de cliente y método de pago (efectivo/tarjeta/transferencia). Atajos de teclado: F2 (buscar), F4 (finalizar), Escape (cerrar). Soporte para scanner de código de barras.
- **Historial de ventas** — Consulta de ventas realizadas con filtro por fechas y detalle de productos.
- **Dashboard** — KPIs en tiempo real: ventas hoy, ventas totales, productos en catálogo, stock bajo, cantidad de clientes.
- **Gestión de inventario** — CRUD de productos y categorías, importación CSV con UPSERT.
- **Clientes** — Base de datos de clientes con foto y datos de contacto.
- **Cupones y promociones** — Descuentos por porcentaje o monto fijo, con fecha de expiración.
- **Reportes** — Estadísticas de ventas, productos con stock bajo.
- **Roles y permisos** — Administrador, Supervisor y Cajero; rutas protegidas por rol.
- **Tema claro/oscuro** — Con seguimiento automático del tema del sistema.
- **Internacionalización** — Español e inglés.
- **Logo con versión Light/Dark** — El negocio puede tener logos distintos para cada tema.
- **Favicon personalizado** — Con fallback al icono por defecto.
- **Notificaciones Toast** — Feedback visual no bloqueante para todas las operaciones.
- **Configuración en vivo** — Los cambios en Settings se aplican al instante sin reiniciar la app (logo, tipografía, nombre).
- **Conversión WebP** — Las imágenes subidas se convierten automáticamente a WebP para optimizar almacenamiento.
- **Datos de prueba** — La primera ejecución siembra la BD con 40 productos, 12 clientes, 25 ventas, cupones y promociones.
- **Base de datos local** — SQLite, sin necesidad de servidores externos.

---

## Requisitos

- **Node.js** v18 o superior
- **npm** (incluido con Node.js)

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

| Usuario    | Contraseña | Rol            |
|------------|-----------|----------------|
| `admin`    | `admin`   | Administrator  |
| `supervisor` | `supervisor` | Supervisor   |
| `cajero`   | `cajero`  | Cashier        |

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
├── webpack.config.js       # Configuración de Webpack
├── config/
│   ├── businessConfig.json # Configuración del negocio (logo, nombre, etc.)
│   └── dbConfig.json       # Ruta de la base de datos SQLite
├── db/
│   ├── sqlite.js           # Conector a SQLite
│   ├── init-db.js          # Inicialización de la BD con schema
│   ├── seed.js             # Datos de prueba (40 productos, ventas, etc.)
│   └── schema.sql          # Esquema de referencia (MySQL original)
├── data/
│   └── tu_negocio.db       # Base de datos SQLite (se crea automáticamente)
├── src/                    # Código fuente React
│   ├── App.jsx             # Componente principal (router, layout, theme)
│   ├── Settings.jsx        # Configuración del negocio (logo, favicon, etc.)
│   ├── ToastContext.jsx    # Sistema de notificaciones Toast
│   ├── utils.js            # Funciones utilitarias compartidas
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx           # KPIs del negocio
│   │   ├── SalesScreen.jsx         # Punto de venta
│   │   ├── SalesHistory.jsx        # Historial de ventas
│   │   ├── ProductManagement.jsx
│   │   ├── Categories.jsx
│   │   ├── Clients.jsx
│   │   ├── Coupons.jsx
│   │   ├── Reports.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Permissions.jsx
│   │   ├── ImportModal.jsx
│   │   ├── UserProfile.jsx
│   │   ├── ProtectedRoute.jsx      # Guard de rutas por rol
│   │   ├── ErrorBoundary.jsx       # Captura de errores de React
│   │   └── ConfirmModal.jsx
│   └── locales/           # Traducciones (es/en)
├── assets/                 # Imágenes estáticas
└── dist/                   # Build de webpack
```

---

## Licencia

MIT
