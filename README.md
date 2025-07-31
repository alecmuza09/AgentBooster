# 🚀 AgentBooster - CRM Integral para Agentes de Seguros

## 📋 Descripción

AgentBooster es una plataforma CRM moderna y completa diseñada específicamente para agentes de seguros. Ofrece gestión integral de leads, pólizas, reportes, finanzas personales y aprendizaje continuo.

## ✨ Características Principales

### 🏠 Dashboard Inteligente
- **Saludo personalizado** con nombre del usuario
- **Estadísticas en tiempo real** de pólizas y leads
- **Alertas de vencimiento** automáticas
- **Métricas de rendimiento** con gráficos interactivos
- **Acciones rápidas** para navegación eficiente

### 📊 Gestión de Leads
- **Vista Kanban** con estados personalizables
- **Vista de lista** con filtros avanzados
- **Seguimiento de inactividad** con alertas visuales
- **Estados dinámicos**: Nuevo, Contactado, Cotizando, Cerrado, Perdido
- **Indicadores de días en cada etapa**

### 📄 Gestión de Pólizas
- **Importación masiva** de CSV con validación
- **Formulario inteligente** con autocompletado
- **Gestión de contactos** múltiples por póliza
- **Alertas automáticas** de vencimiento
- **Documentos adjuntos** con gestión integrada
- **Filtros y búsqueda** avanzados

### 💰 Finanzas 360°
- **7 módulos financieros** completos:
  - 📊 Dashboard con estadísticas automáticas
  - 👤 Datos Generales del cliente
  - 💰 Gestión de Ingresos
  - 💸 Gestión de Gastos
  - ⚖️ Balance Financiero
  - 📈 Cartera de Inversiones
  - 🛡️ Gestión de Seguros
- **Cálculos automáticos** de métricas financieras
- **Metas financieras** con seguimiento de progreso
- **Formato de moneda mexicana**

### 🎓 Centro de Aprendizaje
- **8 cursos especializados** en seguros
- **5 categorías**: Videos, Documentos, Audio, Cursos, Webinars
- **3 niveles de dificultad**: Principiante, Intermedio, Avanzado
- **Sistema de favoritos** y progreso
- **Contenido premium** y gratuito
- **Instructores profesionales**

### 📈 Reportes Avanzados
- **Datos reales** desde Supabase
- **Gráficos interactivos** con Recharts
- **Métricas de rendimiento** detalladas
- **Análisis de tendencias** temporales
- **Exportación de datos**

### 🔧 Funcionalidades Técnicas
- **Importación CSV** con validación completa
- **Base de datos Supabase** con PostgreSQL
- **Autenticación segura** con JWT
- **Modo oscuro/claro** completo
- **Diseño responsive** para todos los dispositivos
- **TypeScript** para type safety

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** para build y desarrollo
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes
- **Lucide React** para iconografía
- **Recharts** para gráficos
- **React Hook Form** para formularios
- **React Dropzone** para uploads
- **PapaParse** para CSV parsing

### Backend
- **Supabase** (PostgreSQL + Auth)
- **Node.js** con Express
- **TypeScript** para type safety
- **Row Level Security** (RLS)

### Herramientas
- **ESLint** para linting
- **PostCSS** para procesamiento CSS
- **date-fns** para manejo de fechas
- **clsx** para clases condicionales

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### 1. Clonar el repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd AgentBooster
```

### 2. Instalar dependencias
```bash
npm install
cd server && npm install
cd ..
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 4. Configurar Supabase
```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto
supabase init

# Aplicar migraciones
supabase db push
```

### 5. Ejecutar el proyecto
```bash
# Desarrollo
npm run dev

# Backend (en otra terminal)
cd server && npm run dev
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes de UI base
│   ├── import/         # Componentes de importación
│   └── finanzas/       # Componentes de finanzas
├── pages/              # Páginas principales
├── data/               # Funciones de datos
├── types/              # Tipos TypeScript
├── hooks/              # Custom hooks
├── contexts/           # Contextos de React
├── utils/              # Utilidades
└── supabaseClient.ts   # Cliente de Supabase
```

## 🎨 Características de Diseño

### Paleta de Colores
- **Primario**: Azul (#3B82F6)
- **Secundario**: Verde (#10B981)
- **Acento**: Púrpura (#8B5CF6)
- **Neutral**: Gris (#6B7280)

### Componentes UI
- **Cards** con gradientes y sombras
- **Botones** con efectos hover
- **Badges** para estados
- **Modales** responsivos
- **Tablas** con sorting y filtros

### Responsive Design
- **Mobile-first** approach
- **Breakpoints**: sm, md, lg, xl
- **Grid system** flexible
- **Navegación adaptativa**

## 📊 Base de Datos

### Tablas Principales
- **policies**: Pólizas de seguros
- **leads**: Prospectos y leads
- **clients**: Información de clientes
- **documents**: Documentos adjuntos
- **contacts**: Contactos por póliza

### Migraciones
- Esquema inicial
- Actualizaciones de leads
- Campos de alertas
- Roles de contactos

## 🔐 Seguridad

- **Row Level Security** (RLS) en Supabase
- **Autenticación JWT**
- **Validación de formularios**
- **Sanitización de datos CSV**
- **Protección de rutas**

## 📈 Métricas y Analytics

### Dashboard
- Total de pólizas activas
- Leads por estado
- Ingresos mensuales
- Tasa de conversión

### Reportes
- Distribución por ramo
- Rendimiento por aseguradora
- Tendencias temporales
- Análisis de clientes

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Notificaciones push
- [ ] Integración con WhatsApp
- [ ] App móvil nativa
- [ ] IA para scoring de leads
- [ ] Integración con APIs de aseguradoras
- [ ] Sistema de comisiones
- [ ] Backup automático

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Tu Nombre]
- **Diseño UX/UI**: [Diseñador]
- **Testing**: [QA]

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@agentbooster.com
- Documentación: [URL_DOCS]
- Issues: [GitHub Issues]

---

**AgentBooster** - Potenciando el éxito de los agentes de seguros 🚀
