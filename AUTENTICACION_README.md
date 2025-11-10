# 🔐 Guía de Autenticación - AgentBooster CRM

## 🎯 Problema Identificado

El sistema de autenticación estaba configurado para hacer login automático con un usuario mock cuando las credenciales de Supabase no estaban disponibles, lo que impedía que los usuarios reales pudieran iniciar sesión.

## ✅ Solución Implementada

### 1. **Autenticación Inteligente**

El sistema ahora verifica primero si las credenciales de Supabase están configuradas y disponibles:

```typescript
// Verificar conexión antes de intentar login
const hasSupabaseCredentials = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!hasSupabaseCredentials) {
    // Modo desarrollo con login mock
    // Usuario puede hacer login manualmente
} else {
    // Intentar conexión real con Supabase
    // Si falla, mostrar error claro
}
```

### 2. **Estados de Conexión Claros**

La página de login ahora muestra el estado de conexión:

- 🟢 **Conectado**: Supabase disponible
- 🟠 **Modo sin conexión**: Usando datos mock
- 🔄 **Verificando**: Comprobando conexión

### 3. **Manejo Mejorado de Errores**

Errores específicos y útiles:

```typescript
if (error.message.includes('Invalid login credentials')) {
    throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
}
if (error.message.includes('Email not confirmed')) {
    throw new Error('Email no confirmado. Revisa tu correo y confirma tu cuenta.');
}
```

## 🚀 Cómo Usar la Autenticación

### Opción 1: Con Supabase (Recomendado)

1. **Configurar variables de entorno**:
```bash
# Copiar .env.example a .env y completar:
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-clave-anonima"
```

2. **Crear usuario en Supabase**:
```sql
-- Insertar usuario de prueba
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('usuario@ejemplo.com', crypt('password123', gen_salt('bf')), NOW());

-- Crear perfil
INSERT INTO public.profiles (id, full_name)
VALUES ((SELECT id FROM auth.users WHERE email = 'usuario@ejemplo.com'), 'Usuario de Prueba');
```

3. **Iniciar sesión normalmente**

### Opción 2: Modo Desarrollo (Sin Supabase)

Si no configuras las variables de entorno, la aplicación funcionará en **modo desarrollo**:

- ✅ **Login manual**: Cualquier email/contraseña funciona
- ✅ **Funcionalidad completa**: Todos los módulos disponibles
- ✅ **Datos mock**: Información de ejemplo para testing
- ⚠️ **Sin persistencia**: Los datos se pierden al recargar

## 🔧 Solución de Problemas

### Problema: "No inicia sesión mi usuario"

**Posibles causas y soluciones:**

#### 1. **Credenciales no configuradas**
```bash
# Verificar que existe el archivo .env
ls -la .env

# Contenido correcto:
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-clave-real"
```

#### 2. **Usuario no existe en Supabase**
```sql
-- Verificar usuarios existentes
SELECT email, email_confirmed_at FROM auth.users;

-- Crear usuario si no existe
-- (Usa el dashboard de Supabase para crear usuarios)
```

#### 3. **Email no confirmado**
- Revisa el correo del usuario
- Confirma la cuenta desde el email de Supabase
- O confirma manualmente en Supabase Dashboard

#### 4. **Problemas de conexión**
- Verifica tu conexión a internet
- Confirma que la URL de Supabase es correcta
- Revisa que las claves API sean válidas

### Problema: "Se queda cargando"

**Diagnóstico:**
1. Abre la consola del navegador (F12)
2. Busca mensajes de error de red
3. Verifica el indicador de conexión en la página de login

**Soluciones:**
- Espera a que aparezca "Conectado" o "Modo sin conexión"
- Si permanece en "Verificando", hay un problema de conexión
- En modo sin conexión, cualquier login funcionará

## 📱 Interfaz Mejorada

### Indicadores Visuales

```jsx
// Estado de conexión
🟢 Conectado           // Supabase OK
🟠 Modo sin conexión   // Desarrollo
🔄 Verificando...      // Comprobando

// Estados de carga
🔄 Iniciando sesión... // Durante login
✅ Login exitoso       // Redirigiendo
❌ Error específico     // Mostrando problema
```

### Manejo de Errores

```jsx
// Antes: Error genérico
<p>Error al iniciar sesión</p>

// Ahora: Error específico con íconos
<div className="bg-red-50 border border-red-200 rounded-md p-3">
  <AlertCircle className="w-4 h-4 text-red-600" />
  <p>Credenciales inválidas. Verifica tu email y contraseña.</p>
</div>
```

## 🔄 Flujo de Autenticación

```
1. Usuario llega a /login
2. Sistema verifica conexión a Supabase
3. Muestra indicador de estado
4. Usuario ingresa credenciales
5. Valida formato básico
6. Intenta autenticación
7. Si falla: muestra error específico
8. Si OK: redirige a dashboard
```

## 🧪 Testing

### Modo Desarrollo
```bash
# Sin variables de entorno
npm run dev
# Cualquier email/contraseña funciona
```

### Modo Producción
```bash
# Con variables configuradas
npm run dev
# Solo usuarios reales de Supabase
```

## 📊 Estados del Sistema

| Estado | Indicador | Funcionalidad |
|--------|-----------|---------------|
| **Online** | 🟢 Conectado | Login real con Supabase |
| **Offline** | 🟠 Sin conexión | Login mock para desarrollo |
| **Checking** | 🔄 Verificando | Esperando verificación |

## 🎯 Próximos Pasos

1. **Configurar Supabase** (opcional pero recomendado)
2. **Crear usuarios** en Supabase Dashboard
3. **Probar login** con credenciales reales
4. **Configurar email** para confirmación de cuentas

---

**✅ Estado**: Autenticación corregida y funcional
**🔧 Modo**: Desarrollo (mock) o Producción (Supabase)
**📱 UI**: Mejorada con indicadores claros
