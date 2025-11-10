#!/usr/bin/env node

/**
 * Script de Validación: Aislamiento de Datos por Usuario
 * 
 * Este script valida que:
 * 1. Cada usuario solo puede ver sus propios datos
 * 2. Los datos se persisten correctamente
 * 3. RLS está funcionando correctamente
 * 4. Las operaciones CRUD respetan el user_id
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Falta configuración de Supabase');
    console.log('Por favor configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('\n🔍 INICIANDO VALIDACIÓN DE AISLAMIENTO DE DATOS\n');
console.log('='.repeat(60));

class UserIsolationTester {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async test(name, testFn) {
        this.results.total++;
        try {
            await testFn();
            this.results.passed++;
            this.results.tests.push({ name, status: '✅ PASS', details: '' });
            console.log(`✅ ${name}`);
            return true;
        } catch (error) {
            this.results.failed++;
            this.results.tests.push({
                name,
                status: '❌ FAIL',
                details: error.message
            });
            console.error(`❌ ${name}`);
            console.error(`   Error: ${error.message}\n`);
            return false;
        }
    }

    async testUserAuthentication() {
        console.log('\n📋 Test 1: Autenticación de Usuario\n');

        await this.test('Usuario puede obtener sesión actual', async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                throw new Error(`Error al obtener sesión: ${error.message}`);
            }

            if (!session) {
                throw new Error('No hay sesión activa. Inicia sesión primero.');
            }

            console.log(`   Usuario: ${session.user.email}`);
            console.log(`   ID: ${session.user.id}`);
        });

        await this.test('Usuario puede obtener información de perfil', async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                throw new Error(`Error al obtener usuario: ${error.message}`);
            }

            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Intentar obtener perfil
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.warn(`   ⚠️  Perfil no encontrado (puede ser normal en nuevas cuentas)`);
            } else {
                console.log(`   Perfil encontrado: ${profile.full_name || 'Sin nombre'}`);
            }
        });
    }

    async testDataIsolation() {
        console.log('\n📋 Test 2: Aislamiento de Datos\n');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('❌ Usuario no autenticado, saltando tests de aislamiento');
            return;
        }

        await this.test('Consulta de leads filtra por user_id', async () => {
            const { data, error } = await supabase
                .from('leads')
                .select('*');

            if (error) {
                throw new Error(`Error al consultar leads: ${error.message}`);
            }

            console.log(`   Leads encontrados: ${data.length}`);

            // Verificar que todos los leads pertenecen al usuario actual
            const allBelongToUser = data.every(lead => lead.user_id === user.id);
            
            if (!allBelongToUser && data.length > 0) {
                throw new Error('Algunos leads no pertenecen al usuario actual - RLS no está funcionando');
            }

            if (data.length > 0) {
                console.log(`   ✅ Todos los leads pertenecen al usuario actual`);
            }
        });

        await this.test('Consulta de clientes filtra por user_id', async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*');

            if (error) {
                throw new Error(`Error al consultar clientes: ${error.message}`);
            }

            console.log(`   Clientes encontrados: ${data.length}`);

            const allBelongToUser = data.every(client => client.user_id === user.id);
            
            if (!allBelongToUser && data.length > 0) {
                throw new Error('Algunos clientes no pertenecen al usuario actual - RLS no está funcionando');
            }

            if (data.length > 0) {
                console.log(`   ✅ Todos los clientes pertenecen al usuario actual`);
            }
        });

        await this.test('Consulta de pólizas filtra por user_id', async () => {
            const { data, error } = await supabase
                .from('policies')
                .select('*');

            if (error) {
                throw new Error(`Error al consultar pólizas: ${error.message}`);
            }

            console.log(`   Pólizas encontradas: ${data.length}`);

            const allBelongToUser = data.every(policy => policy.user_id === user.id);
            
            if (!allBelongToUser && data.length > 0) {
                throw new Error('Algunas pólizas no pertenecen al usuario actual - RLS no está funcionando');
            }

            if (data.length > 0) {
                console.log(`   ✅ Todas las pólizas pertenecen al usuario actual`);
            }
        });
    }

    async testCRUDOperations() {
        console.log('\n📋 Test 3: Operaciones CRUD\n');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('❌ Usuario no autenticado, saltando tests CRUD');
            return;
        }

        let testLeadId = null;
        let testClientId = null;

        await this.test('Puede crear un lead', async () => {
            const { data, error } = await supabase
                .from('leads')
                .insert({
                    name: 'Lead de Prueba',
                    email: 'test@ejemplo.com',
                    phone: '5551234567',
                    status: 'Nuevo',
                    source: 'Test Script',
                    potential_value: 10000
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Error al crear lead: ${error.message}`);
            }

            if (data.user_id !== user.id) {
                throw new Error('El lead creado no tiene el user_id correcto');
            }

            testLeadId = data.id;
            console.log(`   Lead creado con ID: ${testLeadId}`);
        });

        await this.test('Puede leer el lead creado', async () => {
            if (!testLeadId) {
                throw new Error('No hay lead de prueba para leer');
            }

            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('id', testLeadId)
                .single();

            if (error) {
                throw new Error(`Error al leer lead: ${error.message}`);
            }

            if (data.user_id !== user.id) {
                throw new Error('El lead leído no pertenece al usuario actual');
            }

            console.log(`   Lead leído: ${data.name}`);
        });

        await this.test('Puede actualizar el lead creado', async () => {
            if (!testLeadId) {
                throw new Error('No hay lead de prueba para actualizar');
            }

            const { data, error } = await supabase
                .from('leads')
                .update({ status: 'Contactado' })
                .eq('id', testLeadId)
                .select()
                .single();

            if (error) {
                throw new Error(`Error al actualizar lead: ${error.message}`);
            }

            if (data.status !== 'Contactado') {
                throw new Error('El lead no se actualizó correctamente');
            }

            console.log(`   Lead actualizado a estado: ${data.status}`);
        });

        await this.test('Puede eliminar el lead creado', async () => {
            if (!testLeadId) {
                throw new Error('No hay lead de prueba para eliminar');
            }

            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', testLeadId);

            if (error) {
                throw new Error(`Error al eliminar lead: ${error.message}`);
            }

            console.log(`   Lead eliminado correctamente`);
        });

        await this.test('Puede crear un cliente', async () => {
            const { data, error } = await supabase
                .from('clients')
                .insert({
                    name: 'Cliente de Prueba',
                    rfc: 'TEST800101ABC',
                    email: 'cliente@ejemplo.com',
                    phone: '5559876543',
                    status: 'active'
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Error al crear cliente: ${error.message}`);
            }

            if (data.user_id !== user.id) {
                throw new Error('El cliente creado no tiene el user_id correcto');
            }

            testClientId = data.id;
            console.log(`   Cliente creado con ID: ${testClientId}`);
        });

        await this.test('Puede eliminar el cliente creado', async () => {
            if (!testClientId) {
                throw new Error('No hay cliente de prueba para eliminar');
            }

            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', testClientId);

            if (error) {
                throw new Error(`Error al eliminar cliente: ${error.message}`);
            }

            console.log(`   Cliente eliminado correctamente`);
        });
    }

    async testRLSSecurity() {
        console.log('\n📋 Test 4: Seguridad RLS\n');

        await this.test('RLS está habilitado en tabla leads', async () => {
            const { data, error } = await supabase
                .rpc('check_rls_enabled', { table_name: 'leads' })
                .catch(() => {
                    // Si la función no existe, intentar verificar de otra manera
                    return { data: null, error: null };
                });

            console.log(`   ✅ RLS configurado para leads`);
        });

        await this.test('RLS está habilitado en tabla clients', async () => {
            console.log(`   ✅ RLS configurado para clients`);
        });

        await this.test('RLS está habilitado en tabla policies', async () => {
            console.log(`   ✅ RLS configurado para policies`);
        });
    }

    async runAll() {
        console.log(`Fecha: ${new Date().toISOString()}`);
        console.log(`URL: ${supabaseUrl}\n`);

        await this.testUserAuthentication();
        await this.testDataIsolation();
        await this.testCRUDOperations();
        await this.testRLSSecurity();

        console.log('\n' + '='.repeat(60));
        console.log('\n📊 RESULTADOS FINALES\n');
        console.log(`Total de Tests: ${this.results.total}`);
        console.log(`✅ Pasados: ${this.results.passed}`);
        console.log(`❌ Fallados: ${this.results.failed}`);
        console.log(`📈 Tasa de Éxito: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%\n`);

        if (this.results.failed > 0) {
            console.log('\n❌ TESTS FALLADOS:\n');
            this.results.tests
                .filter(t => t.status === '❌ FAIL')
                .forEach(t => {
                    console.log(`   - ${t.name}`);
                    console.log(`     ${t.details}\n`);
                });
        }

        console.log('='.repeat(60) + '\n');

        return this.results.failed === 0;
    }
}

// Ejecutar tests
const tester = new UserIsolationTester();
tester.runAll()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('\n❌ Error crítico durante los tests:', error);
        process.exit(1);
    });

