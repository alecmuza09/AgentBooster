# 🔌 Integración con Supabase MCP

Este documento explica cómo integrar [Supabase MCP](https://github.com/supabase-community/supabase-mcp) para mejorar la funcionalidad y debugging de AgentBooster.

---

## 📖 ¿Qué es Supabase MCP?

**MCP (Model Context Protocol)** permite a los asistentes de IA (como Claude, Cursor, etc.) conectarse directamente con Supabase para:

✅ Ejecutar consultas SQL en tiempo real  
✅ Ver logs de servicios (API, Postgres, Auth, Storage)  
✅ Generar TypeScript types automáticamente  
✅ Gestionar Edge Functions  
✅ Crear y gestionar branches de desarrollo  
✅ Obtener advisories de seguridad  

---

## 🚀 Instalación Rápida

### Opción 1: Usar con Cursor/Claude Desktop

1. **Instalar el servidor MCP**:

```bash
npx @supabase/mcp install
```

2. **Configurar en tu AI Assistant** (Cursor/Claude):

Añade a tu configuración MCP (`~/Library/Application Support/Cursor/User/mcp.json` o similar):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "@supabase/mcp",
        "--access-token",
        "TU_SUPABASE_ACCESS_TOKEN",
        "--project-ref",
        "TU_PROJECT_REF"
      ]
    }
  }
}
```

### Opción 2: Usar servidor MCP Cloud

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "params": {
        "access_token": "TU_SUPABASE_ACCESS_TOKEN",
        "project_ref": "TU_PROJECT_REF",
        "features": "database,docs,debugging,development"
      }
    }
  }
}
```

---

## 🔑 Obtener Credenciales

### 1. Access Token

Ve a: https://supabase.com/dashboard/account/tokens

1. Crea un nuevo token
2. Dale permisos necesarios
3. Copia el token (se muestra solo una vez)

### 2. Project Ref

Ve a: https://supabase.com/dashboard/project/TU_PROYECTO/settings/general

- Busca "Reference ID"
- Copia el valor (formato: `abcdefghijklmnop`)

---

## 🛠️ Herramientas Disponibles

### 📊 Database Tools (Habilitado por defecto)

```typescript
// Listar tablas
list_tables()

// Listar extensiones
list_extensions()

// Ejecutar SQL
execute_sql({ sql: "SELECT * FROM leads WHERE user_id = auth.uid()" })

// Aplicar migración
apply_migration({ sql: "ALTER TABLE policies ADD COLUMN new_field TEXT;" })
```

### 🔍 Debugging Tools (Habilitado por defecto)

```typescript
// Ver logs
get_logs({ service: 'postgres', level: 'error' })
get_logs({ service: 'auth', level: 'info' })

// Ver advisories
get_advisors()
```

### 🚀 Development Tools (Habilitado por defecto)

```typescript
// Obtener URL del proyecto
get_project_url()

// Obtener API keys
get_publishable_keys()

// Generar TypeScript types
generate_typescript_types()
```

### 📚 Knowledge Base (Habilitado por defecto)

```typescript
// Buscar en documentación
search_docs({ query: "row level security" })
search_docs({ query: "authentication flows" })
```

### 🌿 Branching Tools (Requiere plan pago)

```typescript
// Crear branch de desarrollo
create_branch({ name: 'feature-new-module' })

// Listar branches
list_branches()

// Merge a producción
merge_branch({ branch_id: 'branch-id-here' })
```

---

## 💡 Casos de Uso para AgentBooster

### 1. Debugging de RLS

```typescript
// Preguntar al AI:
"¿Puedes verificar por qué el usuario no puede ver sus leads?"

// El AI usará MCP para:
1. execute_sql("SELECT * FROM pg_policies WHERE tablename = 'leads'")
2. get_logs({ service: 'postgres', level: 'error' })
3. search_docs({ query: "row level security debugging" })
```

### 2. Generar Types Actualizados

```typescript
// Preguntar al AI:
"Genera los TypeScript types actualizados para mi base de datos"

// El AI usará:
generate_typescript_types()

// Y guardará el resultado en: src/types/database.types.ts
```

### 3. Monitorear Errores

```typescript
// Preguntar al AI:
"¿Hay errores recientes en la API?"

// El AI usará:
get_logs({ service: 'api', level: 'error', limit: 10 })
get_advisors() // Verificar problemas de seguridad
```

### 4. Crear Migraciones

```typescript
// Preguntar al AI:
"Añade una columna 'notes' a la tabla policies"

// El AI usará:
apply_migration({
  sql: `
    ALTER TABLE policies 
    ADD COLUMN IF NOT EXISTS notes TEXT;
  `
})
```

---

## 🔒 Seguridad

### ⚠️ Recomendaciones Importantes

1. **NO conectar a producción directamente**
   - Usa branches de desarrollo
   - Prueba cambios en staging primero

2. **Modo Read-Only**
   ```json
   {
     "args": ["--read-only"]
   }
   ```

3. **Limitar Features**
   ```json
   {
     "features": "database,docs,debugging"
   }
   ```
   (Excluye: storage, branching, functions)

4. **Revisar Tool Calls**
   - Cursor/Claude muestran las acciones antes de ejecutarlas
   - **SIEMPRE revisa** antes de aprobar

---

## 📋 Configuración Recomendada para AgentBooster

```json
{
  "mcpServers": {
    "supabase-dev": {
      "url": "https://mcp.supabase.com/mcp",
      "params": {
        "access_token": "TU_TOKEN_AQUI",
        "project_ref": "TU_PROJECT_REF",
        "features": "database,docs,debugging,development",
        "read_only": false
      },
      "description": "Supabase MCP para desarrollo de AgentBooster"
    }
  }
}
```

---

## 🧪 Testing con MCP

### Validar Aislamiento de Usuarios

```typescript
// Preguntar al AI:
"Valida que las políticas RLS estén funcionando correctamente para leads"

// El AI ejecutará:
1. list_tables()
2. execute_sql("SELECT * FROM pg_policies WHERE tablename = 'leads'")
3. execute_sql("SELECT user_id, COUNT(*) FROM leads GROUP BY user_id")
4. get_advisors() // Verificar problemas de seguridad
```

### Verificar Triggers

```typescript
// Preguntar al AI:
"Verifica que el trigger update_client_policy_count esté funcionando"

// El AI ejecutará:
1. execute_sql("SELECT * FROM pg_trigger WHERE tgname LIKE '%client%'")
2. execute_sql("SELECT * FROM clients LIMIT 5")
3. execute_sql("SELECT client_id, COUNT(*) FROM policies GROUP BY client_id")
```

---

## 📊 Monitoreo Continuo

### Dashboard de Logs

Puedes pedir al AI que monitoree logs periódicamente:

```
"Dame un resumen de los logs de las últimas 24 horas"
"¿Hay errores de autenticación recientes?"
"Muéstrame las queries más lentas"
```

### Advisories de Seguridad

```
"¿Hay problemas de seguridad en mi proyecto?"
"Verifica si hay vulnerabilidades conocidas"
```

---

## 🔗 Referencias

- [Supabase MCP GitHub](https://github.com/supabase-community/supabase-mcp)
- [MCP Official Docs](https://modelcontextprotocol.io)
- [Supabase Docs](https://supabase.com/docs)

---

## 🎯 Próximos Pasos

1. ✅ Instala Supabase MCP
2. ✅ Configura tus credenciales
3. ✅ Prueba con queries simples
4. ✅ Habilita debugging de RLS
5. ✅ Genera TypeScript types
6. ✅ Monitorea logs de producción

---

## 💪 Comandos Útiles

```bash
# Instalar MCP
npx @supabase/mcp install

# Actualizar MCP
npm update @supabase/mcp -g

# Ver versión
npx @supabase/mcp --version

# Ver ayuda
npx @supabase/mcp --help
```

---

¿Necesitas ayuda? Consulta la [documentación oficial](https://github.com/supabase-community/supabase-mcp) o pregunta en el [Discord de Supabase](https://discord.supabase.com).

