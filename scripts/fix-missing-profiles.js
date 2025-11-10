#!/usr/bin/env node

/**
 * Script de Corrección: Crear perfiles faltantes
 * 
 * Este script:
 * 1. Encuentra usuarios sin perfil
 * 2. Crea perfiles automáticamente
 * 3. Verifica que todo esté correcto
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Falta configuración de Supabase');
    console.log('\nNecesitas configurar en .env:');
    console.log('  VITE_SUPABASE_URL=https://tu-proyecto.supabase.co');
    console.log('  VITE_SUPABASE_ANON_KEY=tu-clave-anonima');
    console.log('\nO ejecuta la migración directamente en Supabase Dashboard:');
    console.log('  supabase/migrations/20251110000000_fix_missing_profiles.sql');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('\n🔧 CORRECCIÓN DE PERFILES FALTANTES\n');
console.log('='.repeat(60));

async function fixMissingProfiles() {
    try {
        console.log('\n📋 Paso 1: Verificando estado actual...\n');

        // Obtener todos los usuarios de auth
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            throw new Error(`Error obteniendo usuarios: ${authError.message}`);
        }

        console.log(`✅ Usuarios en auth.users: ${users.length}`);

        // Obtener todos los perfiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id');

        if (profilesError) {
            throw new Error(`Error obteniendo perfiles: ${profilesError.message}`);
        }

        console.log(`✅ Perfiles en profiles: ${profiles.length}`);

        // Encontrar usuarios sin perfil
        const profileIds = new Set(profiles.map(p => p.id));
        const usersWithoutProfile = users.filter(u => !profileIds.has(u.id));

        console.log(`\n${usersWithoutProfile.length === 0 ? '✅' : '⚠️'}  Usuarios sin perfil: ${usersWithoutProfile.length}\n`);

        if (usersWithoutProfile.length === 0) {
            console.log('✅ ¡Todos los usuarios tienen perfil!\n');
            console.log('='.repeat(60));
            return true;
        }

        console.log('📋 Paso 2: Creando perfiles faltantes...\n');

        // Crear perfil para cada usuario sin perfil
        for (const user of usersWithoutProfile) {
            const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
            const avatarUrl = user.user_metadata?.avatar_url || null;

            console.log(`   Creando perfil para: ${user.email} (${user.id})`);

            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                });

            if (insertError) {
                console.error(`   ❌ Error: ${insertError.message}`);
            } else {
                console.log(`   ✅ Perfil creado exitosamente`);
            }
        }

        console.log('\n📋 Paso 3: Verificando resultado...\n');

        // Verificar de nuevo
        const { data: newProfiles, error: newProfilesError } = await supabase
            .from('profiles')
            .select('id');

        if (newProfilesError) {
            throw new Error(`Error verificando perfiles: ${newProfilesError.message}`);
        }

        const newProfileIds = new Set(newProfiles.map(p => p.id));
        const stillMissing = users.filter(u => !newProfileIds.has(u.id));

        if (stillMissing.length === 0) {
            console.log('✅ ¡Todos los perfiles se crearon exitosamente!\n');
            console.log(`   Total usuarios: ${users.length}`);
            console.log(`   Total perfiles: ${newProfiles.length}`);
            console.log('\n='.repeat(60));
            return true;
        } else {
            console.error(`❌ Aún faltan ${stillMissing.length} perfiles\n`);
            stillMissing.forEach(u => {
                console.error(`   - ${u.email} (${u.id})`);
            });
            console.log('\n='.repeat(60));
            return false;
        }

    } catch (error) {
        console.error('\n❌ Error crítico:', error.message);
        console.error('\n💡 Solución alternativa:');
        console.error('   1. Ve a Supabase Dashboard');
        console.error('   2. Abre SQL Editor');
        console.error('   3. Ejecuta el archivo:');
        console.error('      supabase/migrations/20251110000000_fix_missing_profiles.sql\n');
        console.log('='.repeat(60));
        return false;
    }
}

// Ejecutar
fixMissingProfiles()
    .then(success => {
        if (success) {
            console.log('\n✅ CORRECCIÓN COMPLETADA');
            console.log('\n🎯 Próximos pasos:');
            console.log('   1. Recarga la aplicación (Ctrl+R)');
            console.log('   2. Inicia sesión nuevamente');
            console.log('   3. Intenta crear un lead/cliente');
            console.log('   4. Debería funcionar correctamente ✓\n');
        } else {
            console.log('\n⚠️  CORRECCIÓN INCOMPLETA');
            console.log('\n💡 Ejecuta la migración manualmente en Supabase Dashboard\n');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });

