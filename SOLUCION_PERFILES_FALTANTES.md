# 🔧 Solución: Error "Foreign Key Constraint leads_user_id_fkey"

## 🚨 El Problema

```
Error: insert or update on table "leads" violates foreign key constraint "leads_user_id_fkey"
```

### ¿Qué significa?

Este error ocurre cuando intentas crear un lead/cliente pero tu usuario **NO tiene perfil** en la tabla `profiles`. 

La tabla `leads` tiene una foreign key que apunta a `profiles`:
```sql
user_id UUID REFERENCES public.profiles(id)
```

Si tu usuario existe en `auth.users` pero NO en `profiles`, todas las operaciones INSERT fallarán.

---

## ✅ Solución Rápida (Opción 1: Script Automático)

### Ejecutar el script de corrección:

```bash
npm run fix:profiles
```

Este script:
1. ✅ Encuentra usuarios sin perfil
2. ✅ Crea perfiles automáticamente
3. ✅ Verifica que todo funcione

### Resultado esperado:

```
🔧 CORRECCIÓN DE PERFILES FALTANTES
============================================================

📋 Paso 1: Verificando estado actual...

✅ Usuarios en auth.users: 1
✅ Perfiles en profiles: 0

⚠️  Usuarios sin perfil: 1

📋 Paso 2: Creando perfiles faltantes...

   Creando perfil para: tuusuario@gmail.com (00269d00-...)
   ✅ Perfil creado exitosamente

📋 Paso 3: Verificando resultado...

✅ ¡Todos los perfiles se crearon exitosamente!

   Total usuarios: 1
   Total perfiles: 1

============================================================

✅ CORRECCIÓN COMPLETADA
```

---

## ✅ Solución Manual (Opción 2: Supabase Dashboard)

### Paso 1: Ir a Supabase Dashboard

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**

### Paso 2: Ejecutar la migración

Copia y pega este SQL:

```sql
-- Crear perfiles para usuarios sin perfil
INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
    au.raw_user_meta_data->>'avatar_url' as avatar_url,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

### Paso 3: Verificar

```sql
-- Verificar que todos tengan perfil
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM public.profiles) as total_perfiles;
```

Deberían ser iguales.

---

## ✅ Solución Completa (Opción 3: Migración Completa)

### En Supabase Dashboard, ejecuta el archivo completo:

`supabase/migrations/20251110000000_fix_missing_profiles.sql`

Este archivo:
1. ✅ Crea perfiles faltantes
2. ✅ Añade política de INSERT
3. ✅ Verifica trigger
4. ✅ Muestra logs de verificación

---

## 🔍 Verificar que Está Solucionado

### Opción 1: En la aplicación

1. Recarga la página (Ctrl+R)
2. Inicia sesión
3. Ve a la consola del navegador (F12)
4. Deberías ver:

```
✅ AuthContext: Sesión encontrada: tuusuario@gmail.com
✅ Perfil encontrado: Tu Nombre
```

### Opción 2: Crear un lead

1. Ve a **Leads**
2. Haz clic en **+ Nuevo Lead**
3. Llena el formulario
4. Haz clic en **Guardar**

Si funciona sin errores = ✅ **SOLUCIONADO**

---

## 🎯 ¿Por qué pasó esto?

### El Problema Original

Tu usuario fue creado **ANTES** de que existiera el trigger `handle_new_user()`, por lo que:

```
auth.users        profiles
┌──────────┐      ┌────────┐
│ Tu User  │  ━━▷ │  ❌    │  (No existe)
└──────────┘      └────────┘
```

### Después de la Corrección

```
auth.users        profiles
┌──────────┐      ┌────────┐
│ Tu User  │  ━━▷ │  ✅    │  (Creado)
└──────────┘      └────────┘
```

---

## 🛡️ Prevención Futura

### El trigger `handle_new_user()` ahora crea perfiles automáticamente:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

**Todos los usuarios nuevos tendrán perfil automáticamente** ✅

---

## 📊 Comandos Útiles

```bash
# Corregir perfiles faltantes
npm run fix:profiles

# Verificar aislamiento de datos
npm run test:user-isolation

# Verificar integridad de base de datos
npm run test:db
```

---

## 🆘 Si Aún No Funciona

### 1. Verifica las credenciales

```bash
# Verifica que .env tenga:
cat .env

# Debería mostrar:
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

### 2. Verifica la conexión

```bash
# En la consola del navegador (F12):
localStorage.getItem('sb-xxxxx-auth-token')
```

Si es `null`, necesitas iniciar sesión de nuevo.

### 3. Revisa los logs

```bash
# En la consola del navegador (F12), busca:
"Error loading user profile"
"Foreign key constraint"
```

### 4. Contacta soporte

Si nada funciona:
- Email: soporte@agentbooster.com
- GitHub Issues: [Crear issue](https://github.com/alecmuza09/AgentBooster/issues)
- Incluye los logs de la consola

---

## ✅ Checklist de Verificación

- [ ] Ejecuté `npm run fix:profiles`
- [ ] El script mostró "✅ CORRECCIÓN COMPLETADA"
- [ ] Recargué la aplicación (Ctrl+R)
- [ ] Inicié sesión nuevamente
- [ ] Puedo crear leads sin errores
- [ ] Puedo crear clientes sin errores
- [ ] No veo errores de "foreign key" en consola

---

## 🎉 ¡Listo!

Una vez completados todos los pasos del checklist, tu aplicación debería funcionar perfectamente:

✅ Puedes crear leads  
✅ Puedes crear clientes  
✅ Puedes crear pólizas  
✅ Los datos se guardan correctamente  
✅ Los datos persisten entre sesiones  

---

**Última actualización**: 2025-11-10

