# Tic-Tac Store - Frontend (React)

Este es el frontend móvil responsivo (**mobile-first**) desarrollado en React + Vite para la materia de **Aplicaciones Web**. Se conecta con la API REST de Laravel.

## Estética y Diseño 🎨
- **Tema Oscuro Premium:** Fondos oscuros profundos con acentos en violeta neón y azul eléctrico.
- **Glassmorphic Cards:** Transparencias modernas y bordes sutiles.
- **Navegación Táctil:** Barra inferior flotante (`BottomNav`) adaptada para smartphones y un carrito de compras interactivo deslizable.

---

## Requisitos Previos ⚙️
Asegúrate de tener instalados:
- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [Git](https://git-scm.com/)

---

## Comenzando 🚀

### 1. Clonar el repositorio
```bash
git clone <URL_DE_TU_REPOSITORIO>
cd tic-tac-store
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar en desarrollo
Inicia el servidor local de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### 4. Compilar para producción
Genera el bundle optimizado en la carpeta `/dist`:
```bash
npm run build
```

---

## Estructura del Código 📁
- **`src/services/api.js`**: Cliente de peticiones Axios centralizado (maneja dinámicamente las rutas locales en puerto 8000 y producción en Vercel con doble prefijo `/api/api`).
- **`src/context/`**: Proveedores de estado globales para Autenticación (`AuthContext`) y Carrito de compras (`CartContext`).
- **`src/components/`**: Módulos visuales reutilizables (`Navbar`, `BottomNav`, `ProductCard`, `CartDrawer`, `LoadingSpinner`).
- **`src/pages/`**: Páginas de la aplicación (`Catalog`, `ProductDetail`, `Checkout`, `Orders`, `Profile`, `Login`, `Register`).
