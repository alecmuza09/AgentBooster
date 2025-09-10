#!/usr/bin/env node

/**
 * Script para verificar la conexión con Supabase
 * Ejecutar con: node scripts/test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function testSupabaseConnection() {
  console.log('🔍 Verificando conexión con Supabase...\n');

  // Verificar variables de entorno
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Variables de entorno no configuradas');
    console.log('📝 Asegúrate de tener un archivo .env.local con:');
    console.log('   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co');
    console.log('   VITE_SUPABASE_ANON_KEY=tu-clave-anonima');
    process.exit(1);
  }

  console.log('✅ Variables de entorno configuradas');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

  // Crear cliente de Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Probar conexión básica
    console.log('\n🔗 Probando conexión básica...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      process.exit(1);
    }

    console.log('✅ Conexión exitosa');

    // Verificar tablas principales
    console.log('\n📊 Verificando tablas principales...');
    
    const tables = [
      'profiles',
      'leads', 
      'policies',
      'policy_contacts',
      'policy_documents',
      'clients'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`⚠️  Tabla ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabla ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabla ${table}: Error - ${err.message}`);
      }
    }

    // Verificar autenticación
    console.log('\n🔐 Verificando configuración de autenticación...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(`⚠️  Autenticación: ${authError.message}`);
    } else {
      console.log('✅ Autenticación configurada correctamente');
    }

    // Verificar storage
    console.log('\n📁 Verificando configuración de storage...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log(`⚠️  Storage: ${bucketError.message}`);
    } else {
      const policyBucket = buckets.find(b => b.name === 'policy_documents');
      if (policyBucket) {
        console.log('✅ Bucket policy_documents encontrado');
      } else {
        console.log('⚠️  Bucket policy_documents no encontrado');
      }
    }

    console.log('\n🎉 Verificación completada!');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Ejecuta las migraciones: supabase db push');
    console.log('   2. Inicia la aplicación: npm run dev');
    console.log('   3. Ve a http://localhost:5173');
    console.log('   4. Regístrate con un nuevo usuario');

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    process.exit(1);
  }
}

// Ejecutar verificación
testSupabaseConnection().catch(console.error);
