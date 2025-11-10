# 🚀 AgentBooster - CRM para Agentes de Seguros

## 📋 Descripción

AgentBooster es una plataforma CRM moderna diseñada para agentes de seguros. Gestiona leads, pólizas, clientes y reportes de manera eficiente.

## ✅ **Estado Actual**: Funcional y Simplificado

**Versión**: v1.0.0 - Versión estable
- ✅ **Funciona localmente** sin configuración
- ✅ **Compatible con Supabase** cuando está disponible
- ✅ **Autenticación automática** en modo desarrollo
- ✅ **Interfaz moderna** y responsiva

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
- **Interfaz moderna** con Tailwind CSS
- **Base de datos Supabase** (opcional)
- **Autenticación automática** en desarrollo
- **Datos de ejemplo** incluidos
- **Modo responsive** para móviles
- **TypeScript** para desarrollo seguro

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

## 🚀 Instalación Rápida

### ⚡ **3 pasos para empezar**

```bash
# 1. Clonar el repositorio
git clone https://github.com/alecmuza09/AgentBooster.git
cd AgentBooster

# 2. Instalar dependencias
npm install

# 3. Ejecutar la aplicación
npm run dev
```

### ✅ **¡Listo!** La aplicación funciona inmediatamente

- **Sin configuración** necesaria
- **Datos de ejemplo** incluidos
- **Autenticación automática** en desarrollo
- **Funciona en**: http://localhost:5173

### 🔧 Configuración con Supabase (Requerido para Datos Reales)

⚠️ **IMPORTANTE**: Para que los datos se guarden y persistan correctamente entre usuarios, DEBES configurar Supabase.

#### Paso 1: Crear archivo `.env` en la raíz del proyecto

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
```

#### Paso 2: Obtener credenciales de Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto (o selecciona uno existente)
3. Ve a **Settings** → **API**
4. Copia:
   - **URL del proyecto**: `VITE_SUPABASE_URL`
   - **anon public key**: `VITE_SUPABASE_ANON_KEY`

#### Paso 3: Ejecutar migraciones

```bash
# Conecta con tu proyecto de Supabase
npx supabase link --project-ref TU_PROJECT_REF

# Aplica las migraciones
npx supabase db push
```

O directamente en el dashboard de Supabase:
1. Ve a **SQL Editor**
2. Ejecuta los archivos en `supabase/migrations/` en orden

#### Paso 4: Reiniciar la aplicación

```bash
npm run dev
```

✅ **Ahora cada usuario verá y guardará SOLO sus propios datos**

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

## 🔐 Seguridad y Aislamiento de Datos

### Row Level Security (RLS)
✅ **Cada usuario ve SOLO sus propios datos**
- Las políticas RLS filtran automáticamente por `user_id`
- Protección a nivel de base de datos (PostgreSQL)
- Imposible ver datos de otros usuarios

### Validaciones
- **Autenticación JWT** con Supabase Auth
- **Validación de formularios** con React Hook Form
- **Sanitización de CSV** en importaciones
- **Protección de rutas** con ProtectedRoute

### Auditoría
Ver `AUDIT_REPORT.md` para:
- Análisis de seguridad completo
- Validación de aislamiento de datos
- Tests de integridad

### Testing
```bash
# Validar que RLS funciona correctamente
npm run test:user-isolation
```

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

## 🔧 Solución de Problemas

### 🚨 Si algo no funciona:

1. **Reinicia la aplicación**:
   ```bash
   # Detener (Ctrl+C) y volver a ejecutar
   npm run dev
   ```

2. **Limpia cache del navegador**:
   - Presiona `Ctrl+Shift+R` (o `Cmd+Shift+R` en Mac)
   - O abre DevTools (F12) → Network → Disable cache

3. **Verifica la consola**:
   - Abre DevTools (F12) → Console
   - Busca mensajes de error en rojo

4. **Si nada funciona**:
   ```bash
   # Borra node_modules y reinstala
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

### ✅ Modo Desarrollo (Sin Supabase)
- **Login**: Cualquier email funciona (ej: `test@test.com`)
- **Contraseña**: Cualquier contraseña funciona
- **Datos**: Se usan ejemplos incluidos
- ⚠️ **Los datos NO se guardan** (solo visualización)

### 🔒 Modo Producción (Con Supabase)
- **Login**: Solo usuarios registrados en Supabase
- **Registro**: Crear cuenta en `/signup`
- **Datos**: Se guardan en base de datos real
- ✅ **Persistencia garantizada**
- ✅ **Aislamiento por usuario**

### 🔍 Auditoría y Validación

```bash
# Validar que los datos se guardan correctamente
npm run test:user-isolation

# Ver reporte de auditoría
cat AUDIT_REPORT.md

# Documentación de integración MCP
cat MCP_INTEGRATION.md
```

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@agentbooster.com
- Documentación: Ver archivos README específicos
- Issues: [GitHub Issues](https://github.com/alecmuza09/AgentBooster/issues)

---

**AgentBooster** - Potenciando el éxito de los agentes de seguros 🚀
