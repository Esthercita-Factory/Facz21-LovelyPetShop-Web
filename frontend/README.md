# LovelyPetShop Frontend (React 19 + TypeScript + Tailwind CSS)

Cliente Web SPA desarrollado para la clínica veterinaria **LovelyPetShop**, integrado directamente con el backend ASP.NET Core API en .NET 10.

---

## 🛠️ Stack Tecnológico

- **React 19** + **TypeScript**
- **Vite v6** (Bundler & Dev Server)
- **Tailwind CSS v4** (`@tailwindcss/vite`) con soporte para modo oscuro (`@custom-variant dark`)
- **Lucide React** (Iconografía moderna y consistente)
- **React Portals** (Para modales estáticos y sin desplazamientos indeseados)

---

## 📂 Estructura de Carpetas

```text
frontend/src/
├── components/
│   ├── appointments/     # Gestión de citas y agenda médica
│   ├── auth/             # Modal de inicio de sesión y registro de clientes
│   ├── common/           # Componentes reutilizables (Button, Input, Select, Badge, Modal, ThemeToggle)
│   ├── dashboard/        # Métricas, estadísticas y gráficos de la clínica
│   ├── employees/        # Gestión del personal y turnos de trabajo
│   ├── landing/          # Página principal pública (Hero, Servicios, Destacados)
│   ├── layout/           # AppLayout, CustomerNavbar y StaffSidebar
│   ├── my-pets/          # Portal del cliente (Historial médico digital y agendamiento)
│   ├── owners/           # Directorio y gestión de propietarios
│   ├── pets/             # Gestión de pacientes, fichas clínicas y registro conjunto 1-paso
│   ├── products/         # Gestión de inventario de insumos / productos
│   └── store/            # Tienda virtual de cara al cliente
├── context/
│   ├── AuthContext.tsx   # Estado global de usuario, token JWT y roles
│   └── ThemeContext.tsx  # Estado global de tema (Light / Dark) persistente en localStorage
├── services/
│   └── api.ts            # Cliente HTTP con interceptores para token JWT y API REST
├── types/
│   └── index.ts          # Interfaces y contratos de tipos en TypeScript
├── App.tsx               # Enrutador reactivo por pestañas y control de acceso
├── index.css             # Estilos globales y temas en Tailwind CSS v4
└── main.tsx              # Punto de entrada de React
```

---

## 🚀 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con HMR
npm run dev

# Compilar para producción (emite a LovelyPetShop.API/wwwroot)
npm run build
```
