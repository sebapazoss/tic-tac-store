# Tic-Tac Store — Guía y Documentación de la API REST

Esta documentación detalla los endpoints de la API REST de **Tic-Tac Store**, su esquema de seguridad y cómo consumirla tanto en entornos locales como de producción. Esta API está diseñada para ser integrada por clientes como aplicaciones móviles (React Native) o frontends desacoplados.

---

## 1. Servidores y Prefijos de URL

Debido a la infraestructura serverless de **Vercel** y la manera en que procesa las rutas a través del punto de entrada `api/index.php`, existe una particularidad con el prefijo `/api` en producción:

*   **Servidor Local:**
    *   **Base URL:** `http://localhost:8000/api`
    *   Ejemplo de llamada: `POST http://localhost:8000/api/login`
*   **Servidor de Producción (Vercel):**
    *   **Base URL:** `https://e-commerse-pazos-vedoya.vercel.app/api`
    *   **Particularidad de Enrutamiento:** Debido a que Vercel ejecuta la aplicación desde la subcarpeta `/api` y Laravel autodetecta esta carpeta como la base de la URL, **Laravel remueve el primer `/api` de la solicitud**.
    *   **Solución (Doble Prefijo):** Para evitar que Laravel redirija las llamadas a las rutas web tradicionales (provocando errores de sesión o códigos `419 CSRF Mismatch`), se debe agregar un `/api` adicional al consumir los endpoints en producción.
    *   Ejemplo de llamada en producción: `POST https://e-commerse-pazos-vedoya.vercel.app/api/api/login`

> [!IMPORTANT]
> Recuerda que al realizar consultas a la URL de producción desde herramientas de testing como **Bruno**, **Postman** o la aplicación cliente, debes utilizar el formato `https://e-commerse-pazos-vedoya.vercel.app/api/api/{endpoint}`.

---

## 2. Esquema de Seguridad y Autenticación

La API implementa **Laravel Sanctum** para autenticación mediante tokens Bearer sin estado (stateless).

### Flujo de Autenticación
1.  **Obtención del Token:** El cliente realiza una solicitud de autenticación (`POST /login` o `POST /register`).
2.  **Almacenamiento del Token:** El servidor responde con un token de acceso temporal en formato de texto plano (por ejemplo, `3|Q74H4CPOQRh...`). El cliente debe almacenar este token de forma segura (ej. *Secure Store* en React Native).
3.  **Consumo Protegido:** En todas las peticiones a endpoints que requieran autenticación (`Auth: Sí`), el cliente debe incluir el token en la cabecera HTTP utilizando el esquema Bearer:
    ```http
    Authorization: Bearer <TU_TOKEN_AQUÍ>
    ```

### Control de Acceso por Roles (Autorización)
Los endpoints se segmentan según el rol del usuario autenticado:
*   **Clientes (Compradores):** Pueden navegar por productos, crear pedidos a su nombre y consultar sus pedidos propios.
*   **Vendedores (Vendors):** Pueden realizar operaciones CRUD sobre los productos y gestionar de manera global los pedidos de la tienda.
*   **Administradores (Admin):** Tienen control total, incluyendo la aprobación o rechazo de nuevas cuentas de vendedor.

---

## 3. Catálogo de Endpoints

### 3.1. Autenticación y Perfil

| Método | Endpoint | Auth | Rol requerido | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/register` | No | Cualquiera | Crea una cuenta de cliente o vendedor (estado inicial del vendedor: `pending`). |
| `POST` | `/login` | No | Cualquiera | Inicia sesión y devuelve el token de acceso. |
| `POST` | `/logout` | **Sí** | Autenticado | Revoca e invalida el token actual del usuario. |
| `GET` | `/user` | **Sí** | Autenticado | Devuelve la información del perfil del usuario autenticado. |

#### Ejemplo de Registro (`POST /register`)
*   **Body (JSON):**
    ```json
    {
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "password": "password123",
      "password_confirmation": "password123",
      "role": "vendedor" 
    }
    ```

#### Ejemplo de Login (`POST /login`)
*   **Body (JSON):**
    ```json
    {
      "email": "juan@example.com",
      "password": "password123"
    }
    ```
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "token": "3|Q74H4CPOQRhQlLG...",
      "user": {
        "id": 2,
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "role": "vendedor",
        "status": "pending"
      }
    }
    ```

---

### 3.2. Productos

| Método | Endpoint | Auth | Rol requerido | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/products` | No | Público | Obtiene el catálogo de productos paginado con soporte para filtros. |
| `GET` | `/products/{product}` | No | Público | Obtiene el detalle de un producto específico. |
| `POST` | `/products` | **Sí** | Vendedor / Admin | Crea un nuevo producto. |
| `PUT` | `/products/{product}` | **Sí** | Vendedor / Admin | Modifica un producto existente. |
| `DELETE` | `/products/{product}` | **Sí** | Vendedor / Admin | Elimina lógicamente un producto. |

#### Filtros en Catálogo (`GET /products`)
Se pueden enviar los siguientes parámetros en la query string:
*   `search`: Búsqueda por coincidencia de texto en el nombre, marca o descripción.
*   `brand`: Filtrar por marca exacta.
*   `max_price`: Limitar a productos con precio menor o igual al valor provisto.
*   `in_stock`: Si se establece en `true`, sólo muestra productos con stock disponible mayor a 0.

#### Ejemplo de Creación (`POST /products`)
*   **Headers:** `Authorization: Bearer <token>`
*   **Body (JSON):**
    ```json
    {
      "name": "Reloj Casio Vintage A158W",
      "description": "Reloj digital retro de acero inoxidable plateado.",
      "price": 35000.00,
      "stock": 10,
      "brand": "Casio",
      "image_url": "https://example.com/images/casio-a158.jpg"
    }
    ```

---

### 3.3. Pedidos (Orders)

La creación de pedidos cuenta con validación estricta de stock disponible mediante transacciones de base de datos para asegurar consistencia e impedir sobreventas.

| Método | Endpoint | Auth | Rol requerido | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/orders` | **Sí** | Cliente (Comprador) | Lista el historial de pedidos del usuario autenticado. |
| `GET` | `/orders/{order}` | **Sí** | Cliente (Comprador) | Detalle de un pedido específico perteneciente al usuario. |
| `POST` | `/orders` | **Opcional**| Cualquiera (Invitado/Cliente) | Registra un nuevo pedido y descuenta stock. Si se envía el Bearer Token, se asocia al usuario autenticado; de lo contrario, se registra como compra de invitado. |
| `GET` | `/admin/orders` | **Sí** | Vendedor / Admin | Lista todos los pedidos globales de la tienda. |
| `GET` | `/admin/orders/{order}`| **Sí** | Vendedor / Admin | Detalle global de cualquier pedido. |
| `PATCH` | `/admin/orders/{order}`| **Sí** | Vendedor / Admin | Actualiza el estado de procesamiento del pedido. |

#### Ejemplo de Creación de Pedido (`POST /orders`)
*   **Headers:** `Authorization: Bearer <token>` (Opcional: solo para vincular a un usuario registrado)
*   **Body (JSON):**
    ```json
    {
      "customer_name": "Juan Comprador",
      "customer_email": "juan@example.com",
      "customer_phone": "3814001234",
      "shipping_address": "Av. Siempreviva 742, Tucumán",
      "shipping_option": "delivery",
      "shipping_cost": 25000.00,
      "notes": "Entregar después de las 18:00 hs",
      "items": [
        {
          "product_id": 1,
          "quantity": 2
        }
      ]
    }
    ```

#### Ejemplo de Modificación de Estado (`PATCH /admin/orders/{order}`)
*   **Headers:** `Authorization: Bearer <token>`
*   **Body (JSON):**
    ```json
    {
      "status": "processing"
    }
    ```
    *Estados válidos:* `pending`, `processing`, `shipped`, `delivered`, `cancelled`.

---

### 3.4. Carrito de Compras (Shopping Cart)

Estos endpoints permiten gestionar el carrito de compras del usuario autenticado en el servidor. 

> [!NOTE]
> Para usuarios no autenticados (invitados), la gestión del carrito se realiza de forma local en el cliente (ej. `AsyncStorage` en React Native) y el pedido se completa directamente mediante `POST /orders` enviando el listado completo de items.

| Método | Endpoint | Auth | Rol requerido | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/cart` | **Sí** | Autenticado | Obtiene la lista de artículos del carrito del usuario con sus subtotales. |
| `POST` | `/cart` | **Sí** | Autenticado | Agrega un producto al carrito (o incrementa cantidad). Valida el stock disponible. |
| `PUT` | `/cart/{product}` | **Sí** | Autenticado | Modifica la cantidad de un artículo en el carrito. |
| `DELETE` | `/cart/{product}` | **Sí** | Autenticado | Elimina un artículo del carrito. |
| `POST` | `/cart/checkout` | **Sí** | Autenticado | Genera un pedido a partir del carrito del usuario y lo vacía tras el éxito. |

#### Ejemplo de Agregar al Carrito (`POST /cart`)
*   **Headers:** `Authorization: Bearer <token>`
*   **Body (JSON):**
    ```json
    {
      "product_id": 1,
      "quantity": 2
    }
    ```

#### Ejemplo de Modificar Cantidad (`PUT /cart/{product}`)
*   **Headers:** `Authorization: Bearer <token>`
*   **Body (JSON):**
    ```json
    {
      "quantity": 4
    }
    ```

#### Ejemplo de Checkout desde Carrito (`POST /cart/checkout`)
*   **Headers:** `Authorization: Bearer <token>`
*   **Body (JSON):**
    ```json
    {
      "customer_name": "Juan Pérez",
      "customer_email": "juan@example.com",
      "customer_phone": "3814001234",
      "shipping_address": "Av. Siempreviva 742, Tucumán",
      "shipping_option": "delivery",
      "shipping_cost": 25000.00,
      "notes": "Entregar después de las 18:00 hs"
    }
    ```
    *Nota:* No es necesario enviar la lista de artículos (`items`), ya que se cargan automáticamente desde el carrito guardado en la base de datos para ese usuario.

---

### 3.5. Gestión de Usuarios (Exclusivo Administrador)

Endpoints para auditar y autorizar a vendedores.

| Método | Endpoint | Auth | Rol requerido | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/admin/users` | **Sí** | Administrador | Lista todos los usuarios de la base de datos (con query param `status=pending` para filtrar solicitudes). |
| `PATCH`| `/admin/users/{user}/approve`| **Sí** | Administrador | Aprueba la cuenta de un vendedor para que pueda iniciar sesión y publicar productos. |
| `PATCH`| `/admin/users/{user}/reject` | **Sí** | Administrador | Rechaza la postulación de un vendedor. |
| `DELETE`| `/admin/users/{user}` | **Sí** | Administrador | Elimina un usuario del sistema. |

---

## 4. Códigos de Estado y Respuestas Comunes

*   `200 OK`: La solicitud fue exitosa.
*   `201 Created`: El recurso se creó exitosamente (ej. al registrarse o generar un pedido).
*   `401 Unauthorized`: No se proporcionó un token de acceso válido en el header o el token expiró.
*   `403 Forbidden`: El usuario está autenticado pero no posee los permisos necesarios (ej. un cliente intentando crear un producto).
*   `422 Unprocessable Entity`: Error de validación en los datos enviados (ej. falta un campo requerido o el stock del producto es insuficiente).
*   `419 CSRF Token Mismatch`: La petición fue interpretada por el middleware web en lugar del middleware de la API. Verifica que la URL contenga el doble prefijo en producción (`/api/api/...`).

---

## 5. Pruebas Rápidas con Clientes de API (Bruno y Postman)

Para facilitar la verificación y el consumo de la API, se incluye un archivo de pruebas en formato JSON compatible con **Bruno** y **Postman** en la raíz del proyecto:

*   **Archivo de Colección:** [Tic-Tac-store-Test.JSON](file:///Users/sebapazoss/Documents/Universidad/Aplicaciones-web/eCommerse-Pazos-Vedoya/Tic-Tac-store-Test.JSON)
*   **Compatibilidad:** Está exportado bajo el esquema de Postman v2.1, lo cual permite importarlo nativamente tanto en **Postman** como en **Bruno** (usando la opción *Import Collection* -> *Postman Collection*).

### Instrucciones de uso en Bruno / Postman:

1.  **Importar el archivo:** Carga el archivo [Tic-Tac-store-Test.JSON](file:///Users/sebapazoss/Documents/Universidad/Aplicaciones-web/eCommerse-Pazos-Vedoya/Tic-Tac-store-Test.JSON) en tu cliente de API.
2.  **Configurar Variables de Colección:**
    La colección viene configurada con dos variables fundamentales para su funcionamiento:
    *   `baseUrl`: Por defecto apunta al entorno local `http://localhost:8000/api`. Si deseas probar en producción, debes cambiar este valor a `https://e-commerse-pazos-vedoya.vercel.app/api/api` (usando el doble prefijo de producción).
    *   `token`: Se utiliza para almacenar el Bearer Token devuelto por los endpoints de autenticación.
3.  **Flujo de prueba recomendado:**
    *   Ejecuta la petición de **Register** o **Login** en la carpeta `AUTH`.
    *   Copia el valor del campo `token` retornado en la respuesta JSON.
    *   Pega ese token en la variable `token` de la colección (o del entorno). Las peticiones autenticadas ya están configuradas para leer automáticamente `Bearer {{token}}`.
    *   A partir de ahí, puedes probar los flujos de creación de productos, generación de pedidos y administración de usuarios.

