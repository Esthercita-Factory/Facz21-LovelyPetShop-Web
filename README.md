# LovelyPetShop Web & REST API - Clínica Veterinaria 🐾

Sistema integral de gestión veterinaria y tienda para mascotas desarrollado con arquitectura limpia por capas en **.NET 10 (ASP.NET Core Web API)** y una **Single Page Application (SPA)** moderna en **React 19 + TypeScript + Tailwind CSS v4**.

---

## 🏗️ Arquitectura de la Solución

El repositorio está organizado bajo el patrón de arquitectura limpia en capas (`LovelyPetShop.sln`):

| Proyecto / Carpeta | Tipo | Descripción |
| :--- | :--- | :--- |
| [`LovelyPetShop.Domain`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/LovelyPetShop.Domain) | Class Library | Entidades del dominio (`User`, `Owner`, `Pet`, `MedicalRecord`, `Appointment`, `Employee`, `Product`) e interfaces. |
| [`LovelyPetShop.DataAccess`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/LovelyPetShop.DataAccess) | Class Library | Persistencia en almacenamiento JSON (`JsonUserRepository`, `JsonOwnerRepository`, etc.). |
| [`LovelyPetShop.Business`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/LovelyPetShop.Business) | Class Library | Reglas de negocio, seguridad (`PasswordHasher` PBKDF2/SHA256) y validaciones de datos. |
| [`LovelyPetShop.API`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/LovelyPetShop.API) | ASP.NET Core API | Controladores RESTful, autenticación JWT, Swagger UI y servidor de archivos estáticos. |
| [`LovelyPetShop.Tests`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/LovelyPetShop.Tests) | xUnit Tests | Suite de pruebas unitarias automatizadas (9/9 pruebas pasando). |
| [`frontend/`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/frontend) | React 19 + TS | Interfaz moderna con Tailwind CSS v4, Lucide Icons, tema claro/oscuro dinámico y React Portals. |

---

## 👥 Usuarios de Prueba y Credenciales (Seed)

El sistema incluye cuentas de prueba precargadas automáticamente al iniciar la aplicación.

* **Ubicación en disco**: [`LovelyPetShop.API/Data/users.json`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/LovelyPetShop.API/Data/users.json)
* **Generador de semillas**: [`LovelyPetShop.Business/Services/AuthService.cs`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/LovelyPetShop.Business/Services/AuthService.cs) en `EnsureSeedUsersAsync()`.

| Rol | Usuario | Correo Electrónico | Contraseña | Permisos y Vistas |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin` | `admin@lovelypet.com` | `Admin123!` | Acceso total al Dashboard, Pacientes, Historiales, Citas, Empleados, Insumos y Tienda. |
| 🩺 **Veterinario** | `vet` | `valeria.vet@lovelypet.com` | `Vet123!` | Gestión de Pacientes, Registro de Fichas/Consultas Médicas y Agenda de Citas. |
| 🛎️ **Recepción** | `recepcion` | `recepcion@lovelypet.com` | `Recepcion123!` | Registro de Propietarios, Registro Rápido Conjunto (1 Paso) y Agenda de Citas. |
| 🐶 **Cliente** | `cliente` | `afcz@gmail.com` | `Cliente123!` | Portal "Mis Mascotas", Consulta de Historial Clínico Digital y Agendamiento de Citas. |

---

## ✨ Características Principales

1. **Autenticación y Seguridad**:
   - Autenticación mediante **JWT (JSON Web Tokens)** con expiración y roles (RBAC).
   - Hashing seguro de contraseñas con sal aleatoria (`PasswordHasher`).
   - Validación estricta de correos electrónicos reales mediante RFC 5322.

2. **Módulo Clínico y Pacientes**:
   - Ficha médica digital con diagnósticos, tratamientos y alertas de próximas vacunas.
   - Búsqueda instantánea y filtrado por especies (Perros, Gatos, Conejos, Aves, etc.).

3. **Agendamiento Inteligente de Citas**:
   - Restricción estricta a fechas y horas actuales o futuras.
   - Validación de horarios hábiles de la clínica (Lun-Sáb: 8:00 AM - 7:00 PM | Dom: 8:00 AM - 2:00 PM).
   - Prevención de citas duplicadas y solapamiento de horarios.

4. **Portal del Propietario ("Mis Mascotas")**:
   - Visualización de las mascotas registradas a nombre del usuario.
   - Consulta del historial clínico completo y agendamiento directo de citas.

5. **Tienda y Catálogo de Productos**:
   - Catálogo interactivo con insignias de categoría de alto contraste y búsqueda en tiempo real.

6. **Diseño y Experiencia de Usuario (UI/UX)**:
   - Tema oscuro y claro persistente en `localStorage`.
   - Modales 100% estáticos centrados mediante **React Portals** (`createPortal(..., document.body)`).
   - Alertas contextuales integradas en formularios.

---

## 💻 Instrucciones de Ejecución

### 1. Iniciar la Aplicación (.NET API + Frontend integrado)
```bash
dotnet run --project LovelyPetShop.API
```
Abre tu navegador en: **`http://localhost:5108`**

Para explorar la documentación interactiva Swagger:
**`http://localhost:5108/swagger`**

---

### 2. Desarrollo en el Frontend (Opcional)
Si deseas modificar componentes o estilos de React en tiempo real con Hot Module Replacement (HMR):
```bash
cd frontend
npm install
npm run dev
```

Para compilar los activos estáticos para producción (se generan en `LovelyPetShop.API/wwwroot`):
```bash
cd frontend
npm run build
```

---

### 3. Ejecutar las Pruebas Unitarias
```bash
dotnet test LovelyPetShop.sln
```

---

### 4. Ejecución en Contenedores Docker
```bash
docker compose up -d --build
```
Accede en `http://localhost:8080`. Más detalles en la guía [`DOCKER.md`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/DOCKER.md).
