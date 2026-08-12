# LovelyPetShop Web & API - Clínica Veterinaria 🐾

Sistema completo de gestión veterinaria refactorizado con arquitectura limpia por capas en **.NET 10**, con una potente **ASP.NET Core Web API** y un **Dashboard Web Moderno** interactivo.

[![CI Pipeline](https://github.com/OWNER/REPOSITORY/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPOSITORY/actions/workflows/ci.yml)

---

## 🏗️ Arquitectura del Proyecto

El repositorio está estructurado en 5 proyectos modulares bajo la solución `LovelyPetShop.sln`:

| Proyecto | Tipo | Descripción |
| :--- | :--- | :--- |
| [`LovelyPetShop.Domain`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/LovelyPetShop.Domain) | Class Library | Entidades (`Owner`, `Pet`) e Interfaces del repositorio y servicios. |
| [`LovelyPetShop.DataAccess`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/LovelyPetShop.DataAccess) | Class Library | Persistencia en disco usando repositorios JSON (`JsonOwnerRepository`, `JsonPetRepository`). |
| [`LovelyPetShop.Business`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/LovelyPetShop.Business) | Class Library | Lógica de negocio y validaciones (`OwnerService`, `PetService`). |
| [`LovelyPetShop.API`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/LovelyPetShop.API) | ASP.NET Core Web API | Endpoints RESTful (`/api/owners`, `/api/pets`, `/api/stats`), Swagger UI y Servidor Web Dashboard. |
| [`LovelyPetShop.Tests`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/LovelyPetShop.Tests) | xUnit Test Project | Suite de pruebas unitarias automatizadas. |

---

## 🚀 Características de la Versión Web

- **Dashboard Interactivo**: Métricas clave en tiempo real, distribución porcentual por especies (Perros, Gatos, Conejos, Aves, etc.) y feed de registros recientes.
- **Gestión de Mascotas**: Búsqueda instantánea, filtrado dinámico por especies, modales de creación/edición de pacientes y eliminación segura.
- **Gestión de Propietarios**: Búsqueda por documento/teléfono/nombre, soporte para tipos de documento oficiales de Colombia (`CC`, `CE`, `TI`, `RC`, `NIT`, `PASAPORTE`, `PEP`, `PPT`), y vista de mascotas asociadas.
- **Registro Rápido en 1 Paso**: Formulario dual para registrar al propietario y su mascota simultáneamente.
- **Swagger / OpenAPI**: Documentación y pruebas interactivas de API disponibles en `/swagger`.
- **Diseño Moderno & Glassmorphic**: Interfaz con tema oscuro, micro-animaciones, badges temáticos y sistema de notificaciones Toast.

---

## 💻 Instrucciones de Ejecución

### 1. Ejecutar la Aplicación Web & REST API
```bash
dotnet run --project LovelyPetShop.API
```
Abre tu navegador en `http://localhost:5000` o la URL indicada en la consola para interactuar con la Web App.

Para explorar la documentación OpenAPI Swagger:
`http://localhost:5000/swagger`

### 2. Ejecutar las Pruebas Unitarias
```bash
dotnet test LovelyPetShop.sln
```

### 3. Construir y Ejecutar con Docker
```bash
docker build -t lovelypetshop-web .
docker run -d -p 8080:8080 lovelypetshop-web
```
Accede a la app en `http://localhost:8080`. Para una explicación detallada de la arquitectura de contenedores, consulta la guía [`DOCKER.md`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/DOCKER.md).

---

## 📝 Endpoints REST API

- `GET /api/stats` - Estadísticas y métricas generales del sistema.
- `GET /api/owners` - Obtener lista de propietarios con sus mascotas.
- `GET /api/owners/{docNumber}` - Buscar propietario por número de documento.
- `POST /api/owners` - Registrar un nuevo propietario.
- `PUT /api/owners/{docNumber}` - Actualizar datos de propietario.
- `DELETE /api/owners/{docNumber}` - Eliminar propietario.
- `GET /api/pets` - Listar todas las mascotas.
- `GET /api/pets/{uuid}` - Buscar mascota por UUID.
- `GET /api/pets/by-owner/{docNumber}` - Mascotas asociadas a un propietario.
- `POST /api/pets` - Registrar mascota.
- `POST /api/pets/with-owner` - Registrar mascota y propietario conjuntamente.
- `PUT /api/pets/{uuid}` - Actualizar mascota.
- `DELETE /api/pets/{uuid}` - Eliminar mascota.
