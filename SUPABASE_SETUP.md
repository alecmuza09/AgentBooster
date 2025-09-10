# Configuración de Supabase para AgentBooster

Este documento explica cómo configurar Supabase para que la aplicación sea completamente funcional.

## 1. Crear un proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa la información del proyecto:
   - Nombre: `agentbooster-crm`
   - Contraseña de base de datos: (guarda esta contraseña)
   - Región: Elige la más cercana a tu ubicación

## 2. Obtener las credenciales

1. En el dashboard de Supabase, ve a **Settings** > **API**
2. Copia los siguientes valores:
   - **Project URL**: `https://tu-proyecto-id.supabase.co`
   - **anon public key**: La clave pública anónima

## 3. Configurar variables de entorno

1. En la raíz del proyecto, crea un archivo `.env.local`:
```bash
cp .env.example .env.local
```

2. Edita el archivo `.env.local` y reemplaza los valores:
```env
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

## 4. Ejecutar las migraciones

1. Instala la CLI de Supabase:
```bash
npm install -g supabase
```

2. Inicia sesión en Supabase:
```bash
supabase login
```

3. Enlaza tu proyecto local con el proyecto de Supabase:
```bash
supabase link --project-ref tu-proyecto-id
```

4. Ejecuta las migraciones:
```bash
supabase db push
```

## 5. Configurar autenticación

1. En el dashboard de Supabase, ve a **Authentication** > **Settings**
2. Configura las siguientes opciones:
   - **Site URL**: `http://localhost:5173` (para desarrollo)
   - **Redirect URLs**: `http://localhost:5173/**`
   - **Email confirmation**: Opcional, según tus necesidades

## 6. Configurar Row Level Security (RLS)

Las migraciones ya incluyen las políticas de RLS necesarias, pero puedes verificar que estén activas:

1. Ve a **Authentication** > **Policies**
2. Verifica que las siguientes tablas tengan políticas activas:
   - `profiles`
   - `leads`
   - `policies`
   - `policy_contacts`
   - `policy_documents`
   - `policy_document_versions`
   - `clients`

## 7. Configurar Storage (opcional)

Para la funcionalidad de documentos:

1. Ve a **Storage** en el dashboard
2. Verifica que el bucket `policy_documents` esté creado
3. Las políticas de storage ya están configuradas en las migraciones

## 8. Probar la aplicación

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Ve a `http://localhost:5173`
3. Intenta registrarte con un nuevo usuario
4. Verifica que puedas:
   - Crear leads
   - Crear pólizas
   - Subir documentos
   - Ver el dashboard con datos reales

## 9. Funcionalidades disponibles

Con Supabase configurado, tendrás acceso a:

### ✅ Completamente funcional:
- **Autenticación**: Registro, login, logout
- **Leads**: CRUD completo
- **Pólizas**: CRUD completo con contactos
- **Documentos**: Subida y gestión de archivos
- **Dashboard**: Estadísticas en tiempo real
- **Clientes**: Gestión de clientes

### 🔄 En desarrollo:
- **Administración**: Gestión de usuarios y permisos
- **Finanzas 360**: Panel financiero personal
- **Aprendizaje**: Cursos y módulos
- **Reportes**: Generación de reportes avanzados

## 10. Solución de problemas

### Error: "Supabase credentials not configured"
- Verifica que el archivo `.env.local` existe y tiene las credenciales correctas
- Reinicia el servidor de desarrollo después de cambiar las variables de entorno

### Error de autenticación
- Verifica que las políticas de RLS estén configuradas correctamente
- Asegúrate de que el usuario esté autenticado antes de hacer operaciones

### Error de permisos en Storage
- Verifica que las políticas de storage estén configuradas
- Asegúrate de que el bucket `policy_documents` exista

### Datos no se cargan
- Verifica la consola del navegador para errores
- Asegúrate de que las migraciones se ejecutaron correctamente
- Verifica que las tablas existan en la base de datos

## 11. Estructura de la base de datos

Las siguientes tablas se crean automáticamente:

- `profiles`: Perfiles de usuario
- `leads`: Prospectos y leads
- `policies`: Pólizas de seguro
- `policy_contacts`: Contactos asociados a pólizas
- `policy_documents`: Documentos de pólizas
- `policy_document_versions`: Versiones de documentos
- `clients`: Clientes
- `courses`: Cursos de aprendizaje
- `modules`: Módulos de cursos
- `finanzas_balance`: Datos financieros personales

## 12. Próximos pasos

Una vez configurado Supabase:

1. **Personaliza las políticas de RLS** según tus necesidades de seguridad
2. **Configura notificaciones por email** para alertas de pago
3. **Implementa reportes avanzados** usando las funciones de Supabase
4. **Configura backups automáticos** de la base de datos
5. **Optimiza las consultas** agregando índices según el uso

---

¿Necesitas ayuda? Revisa la [documentación oficial de Supabase](https://supabase.com/docs) o crea un issue en el repositorio.
