# 🐳 Guía Completa de Docker - LovelyPetShop Web

Este documento explica en detalle el funcionamiento de **Docker** en el proyecto **LovelyPetShop**, la estructura de su [`Dockerfile`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/Dockerfile), el concepto de **Multi-Stage Build** y las instrucciones paso a paso para construir, ejecutar y desplegar la aplicación en contenedores.

---

## 🎯 ¿Por qué usar Docker en este proyecto .NET 10?

Docker permite empaquetar la Web API y la interfaz web junto con todas sus dependencias (.NET Runtime, librerías del sistema) en una **imagen ligera e independiente**. 

Esto garantiza que la aplicación se ejecute **exactamente igual** en cualquier entorno (desarrollo local, servidor Linux, Kubernetes, AWS, Azure), sin necesidad de instalar el SDK de .NET 10 manualmente en la máquina host.

---

## 🏗️ Explicación del `Dockerfile` (Multi-Stage Build)

El proyecto utiliza una estrategia avanzada llamada **Multi-Stage Build (Construcción Multietapa)**. Esto nos permite separar el proceso en **2 etapas principales**:

1. **Etapa de Compilación (`build`)**: Usa la imagen completa del **SDK de .NET 10** (`sdk:10.0`), que incluye compiladores y herramientas para transformar el código fuente C# en binaries (`.dll`).
2. **Etapa Final / Ejecución (`final`)**: Usa una imagen ultra ligera del **ASP.NET Core Runtime** (`aspnet:10.0`), copiando únicamente los archivos binarios compilados.

> 💡 **Beneficio**: La imagen final pesa aproximadamente **200 MB** en lugar de los **~800 MB** que pesaría si dejáramos el SDK de compilación. Además, es mucho más segura para producción.

---

### 📝 Análisis Línea por Línea del `Dockerfile`

```dockerfile
# -------------------------------------------------------------------
# ETAPA 1: Compilación y Publicación
# -------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# 1. Copiar los archivos de proyecto (.csproj) de cada capa para optimizar la caché
COPY ["LovelyPetShop.Domain/LovelyPetShop.Domain.csproj", "LovelyPetShop.Domain/"]
COPY ["LovelyPetShop.DataAccess/LovelyPetShop.DataAccess.csproj", "LovelyPetShop.DataAccess/"]
COPY ["LovelyPetShop.Business/LovelyPetShop.Business.csproj", "LovelyPetShop.Business/"]
COPY ["LovelyPetShop.API/LovelyPetShop.API.csproj", "LovelyPetShop.API/"]
COPY ["LovelyPetShop.Tests/LovelyPetShop.Tests.csproj", "LovelyPetShop.Tests/"]

# 2. Restaurar dependencias NuGet (aprovecha la caché de Docker si no cambiaron dependencias)
RUN dotnet restore "LovelyPetShop.API/LovelyPetShop.API.csproj"

# 3. Copiar todo el código fuente del repositorio y compilar en modo Release
COPY . .
WORKDIR "/src/LovelyPetShop.API"
RUN dotnet publish "LovelyPetShop.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# -------------------------------------------------------------------
# ETAPA 2: Entorno de Ejecución (Runtime)
# -------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# 4. Copiar los binarios optimizados creados en la Etapa 1
COPY --from=build /app/publish .

# 5. Exponer el puerto 8080 y configurar variables de entorno para ASP.NET Core
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# 6. Comando de inicio cuando el contenedor arranca
ENTRYPOINT ["dotnet", "LovelyPetShop.API.dll"]
```

---

## 🚀 Comandos para Ejecutar con Docker CLI

### 1. Construir la Imagen de Docker
Ubicado en la raíz del proyecto, ejecuta:

```bash
docker build -t lovelypetshop-web .
```

* `-t lovelypetshop-web`: Le asigna el nombre/etiqueta `lovelypetshop-web` a la imagen.
* `.`: Indica que el contexto de construcción es el directorio actual.

### 2. Ejecutar el Contenedor
Una vez creada la imagen, inicia el contenedor con:

```bash
docker run -d -p 8080:8080 --name lovelypetshop_app lovelypetshop-web
```

* `-d`: Ejecuta el contenedor en segundo plano (detached mode).
* `-p 8080:8080`: Mapea el puerto `8080` de tu equipo (host) al puerto `8080` del contenedor.
* `--name lovelypetshop_app`: Nombre amigable para el contenedor en ejecución.

Abre tu navegador en: **`http://localhost:8080`**

### 3. Ver Logs del Contenedor
Para inspeccionar la consola de la API dentro del contenedor:

```bash
docker logs -f lovelypetshop_app
```

### 4. Detener y Eliminar el Contenedor
```bash
docker stop lovelypetshop_app
docker rm lovelypetshop_app
```

---

## 🐙 Ejecución Simplificada con Docker Compose

El repositorio incluye un archivo [`docker-compose.yml`](file:///home/facz/Documentos/Facz.dev/C%23/Projects/Facz21-LovelyPetShop-Web/docker-compose.yml) para gestionar el contenedor fácilmente sin recordar comandos largos.

### Iniciar la Aplicación:
```bash
docker compose up -d --build
```

### Detener la Aplicación:
```bash
docker compose down
```

---

## 🌐 Puertos y Endpoints Disponibles en Docker

| Recurso | URL en Docker | Descripción |
| :--- | :--- | :--- |
| **Dashboard Web** | `http://localhost:8080` | Interfaz interactiva de la clínica veterinaria. |
| **Swagger UI (OpenAPI)** | `http://localhost:8080/swagger` | Documentación y pruebas interactivas de endpoints REST API. |
| **Métricas API** | `http://localhost:8080/api/stats` | Endpoint JSON con estadísticas en tiempo real. |
