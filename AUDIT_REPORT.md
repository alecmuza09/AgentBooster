# 🔍 Auditoría de Contenido y Persistencia de Datos

**Fecha**: 2025-11-10
**Estado**: ⚠️ PROBLEMAS CRÍTICOS IDENTIFICADOS

---

## 🚨 Problemas Críticos Encontrados

### 1. **Sistema de Autenticación - Usuario Mock**
**Severidad**: 🔴 CRÍTICA

**Problema**:
- `AuthContext.tsx` crea un usuario mock (`dev-user-123`) cuando no hay credenciales
- Este usuario NO existe en la base de datos
- Los datos creados con este usuario NO se guardan en Supabase

**Ubicación**: `src/contexts/AuthContext.tsx` líneas 47-68, 76-99

**Impacto**:
```
❌ Los usuarios ven datos mock en lugar de datos reales
❌ Los datos creados NO se persisten en la base de datos
❌ Cada usuario ve los mismos datos de ejemplo
❌ No hay separación de datos entre usuarios
```

---

### 2. **Operaciones CRUD sin filtro `user_id`**
**Severidad**: 🔴 CRÍTICA

**Problema**:
- Las consultas a Supabase NO filtran por `user_id`
- Todos los usuarios verían los mismos datos (si funcionara)
- RLS está configurado pero las queries no lo respetan

**Archivos Afectados**:

#### `src/data/policies.ts` - línea 187-191
```typescript
// ❌ INCORRECTO: No filtra por usuario
const { data, error } = await supabase
    .from('policies')
    .select('*')
    .limit(50)
    .abortSignal(controller.signal);

// ✅ CORRECTO: Debería ser
const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('user_id', currentUserId)  // <-- FALTA ESTO
    .limit(50)
    .abortSignal(controller.signal);
```

#### `src/data/clients.ts` - línea 84-89
```typescript
// ❌ INCORRECTO: No filtra por usuario
const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)
    .abortSignal(controller.signal);
```

#### `src/data/leads.ts` - línea 23-28
```typescript
// ❌ INCORRECTO: No filtra por usuario
const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)
    .abortSignal(controller.signal);
```

**Impacto**:
```
❌ Sin filtro user_id, RLS bloquea TODAS las queries
❌ Los usuarios NO pueden ver sus propios datos
❌ Los usuarios NO pueden crear datos nuevos
❌ Cada operación retorna vacío o error
```

---

### 3. **Operaciones INSERT sin `user_id`**
**Severidad**: 🔴 CRÍTICA

**Problema**:
- Al crear nuevos registros (clients, leads, policies) NO se incluye el `user_id`
- RLS rechaza la inserción porque viola la política

**Archivos Afectados**:

#### `src/data/clients.ts` - línea 140-152
```typescript
// ❌ INCORRECTO: Falta user_id
const { data, error } = await supabase
    .from('clients')
    .insert({
        name: clientData.name,
        rfc: clientData.rfc,
        // ... otros campos
        // ❌ FALTA: user_id: currentUserId
    })
```

#### `src/data/leads.ts` - línea 92-104
```typescript
// ❌ INCORRECTO: Falta user_id
const { data, error } = await supabase
    .from('leads')
    .insert({
        name: leadData.name,
        // ... otros campos
        // ❌ FALTA: user_id: currentUserId
    })
```

---

### 4. **Configuración de Supabase Client**
**Severidad**: 🟡 MEDIA

**Problema**:
- El cliente de Supabase crea un mock cuando no hay credenciales
- Esto oculta errores de configuración

**Ubicación**: `src/supabaseClient.ts` líneas 14-38

**Impacto**:
```
⚠️  Los desarrolladores no saben si Supabase está configurado
⚠️  Los errores se ocultan con datos mock
⚠️  Dificulta el debugging y testing
```

---

## ✅ Elementos Correctos

### RLS (Row Level Security)
✅ Las políticas RLS están correctamente configuradas:
- `supabase/migrations/20250703100000_create_initial_schema.sql`
- Políticas: SELECT, INSERT, UPDATE, DELETE filtran por `auth.uid()`

### Esquema de Base de Datos
✅ Las tablas tienen la estructura correcta:
- `clients` tiene `user_id UUID REFERENCES profiles(id)`
- `policies` tiene `user_id UUID REFERENCES profiles(id)`
- `leads` tiene `user_id UUID REFERENCES profiles(id)`

### Triggers y Funciones
✅ Triggers automáticos funcionan:
- `handle_new_user()`: Crea perfil automáticamente
- `update_client_policy_count()`: Actualiza conteo de pólizas
- `update_client_alerts()`: Actualiza alertas de clientes

---

## 📋 Plan de Corrección

### Fase 1: Autenticación Real (Alta Prioridad)
1. ✅ Eliminar usuario mock de desarrollo
2. ✅ Requerir credenciales de Supabase válidas
3. ✅ Añadir validación de sesión real
4. ✅ Manejar estados de "no autenticado" correctamente

### Fase 2: Filtros por Usuario (Alta Prioridad)
1. ✅ Añadir `.eq('user_id', auth.uid())` a todas las consultas SELECT
2. ✅ Añadir `user_id: auth.uid()` a todas las operaciones INSERT
3. ✅ Verificar operaciones UPDATE y DELETE

### Fase 3: Testing y Validación (Media Prioridad)
1. ✅ Crear script de prueba con usuarios reales
2. ✅ Validar que cada usuario ve solo sus datos
3. ✅ Validar que los datos persisten correctamente
4. ✅ Validar operaciones CRUD completas

### Fase 4: Integración con MCP de Supabase (Opcional)
1. ⏳ Configurar [Supabase MCP](https://github.com/supabase-community/supabase-mcp)
2. ⏳ Habilitar herramientas de debugging
3. ⏳ Habilitar herramientas de desarrollo
4. ⏳ Configurar logs y monitoreo

---

## 🎯 Resultado Esperado

Después de las correcciones:

```typescript
// ✅ Usuario A (usuario1@email.com)
- Ve solo SUS pólizas, clientes y leads
- Puede crear nuevos registros
- Los datos persisten entre sesiones
- No puede ver datos de otros usuarios

// ✅ Usuario B (usuario2@email.com)
- Ve solo SUS pólizas, clientes y leads
- Datos completamente independientes de Usuario A
- Persistencia garantizada
- Seguridad de datos mediante RLS
```

---

## 📊 Métricas de Éxito

- [ ] Cada usuario ve SOLO sus datos
- [ ] Los datos se guardan correctamente en Supabase
- [ ] Los datos persisten entre sesiones
- [ ] RLS bloquea acceso no autorizado
- [ ] Las operaciones CRUD funcionan correctamente
- [ ] No hay errores en consola relacionados con permisos

---

## 🔗 Referencias

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase MCP Server](https://github.com/supabase-community/supabase-mcp)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

