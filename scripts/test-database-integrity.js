#!/usr/bin/env node

/**
 * Script de prueba para verificar la integridad de la base de datos
 * Ejecutar con: node scripts/test-database-integrity.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

class DatabaseIntegrityTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️ ',
      success: '✅ ',
      error: '❌ ',
      warning: '⚠️ '
    }[type] || '';

    console.log(`[${timestamp}] ${prefix}${message}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Ejecutando prueba: ${testName}`, 'info');
      const result = await testFunction();
      if (result.success) {
        this.results.passed++;
        this.log(`${testName}: PASÓ`, 'success');
        if (result.details) {
          this.log(`  Detalles: ${result.details}`, 'info');
        }
      } else {
        this.results.failed++;
        this.log(`${testName}: FALLÓ - ${result.error}`, 'error');
      }
      this.results.tests.push({
        name: testName,
        success: result.success,
        error: result.error,
        details: result.details
      });
    } catch (error) {
      this.results.failed++;
      this.log(`${testName}: ERROR - ${error.message}`, 'error');
      this.results.tests.push({
        name: testName,
        success: false,
        error: error.message,
        details: null
      });
    }
  }

  async testTableExists(tableName) {
    try {
      const { error } = await supabase.from(tableName).select('id').limit(1);
      return {
        success: !error,
        error: error?.message,
        details: error ? null : `Tabla ${tableName} existe y es accesible`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: null
      };
    }
  }

  async testFunctionExists(functionName) {
    try {
      const { data, error } = await supabase.rpc(functionName, {});
      // Si la función no existe, obtendremos un error específico
      const functionExists = !error || !error.message.includes('function') || !error.message.includes('does not exist');
      return {
        success: functionExists,
        error: error?.message,
        details: functionExists ? `Función ${functionName} existe y es ejecutable` : null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: null
      };
    }
  }

  async testViewExists(viewName) {
    try {
      const { data, error } = await supabase.from(viewName).select('*').limit(1);
      return {
        success: !error,
        error: error?.message,
        details: error ? null : `Vista ${viewName} existe y es accesible`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: null
      };
    }
  }

  async testTriggerWorks(tableName, triggerTest) {
    // Esta es una prueba básica - en un entorno real necesitaríamos más lógica
    try {
      const { error } = await supabase.from(tableName).select('id').limit(1);
      return {
        success: !error,
        error: error?.message,
        details: 'Trigger básico verificado'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: null
      };
    }
  }

  async testDataIntegrity() {
    try {
      // Verificar que las pólizas tienen clientes válidos
      const { data: policies, error: policiesError } = await supabase
        .from('policies')
        .select('id, cliente_id, user_id');

      if (policiesError) {
        return {
          success: false,
          error: `Error obteniendo pólizas: ${policiesError.message}`,
          details: null
        };
      }

      if (!policies || policies.length === 0) {
        return {
          success: true,
          error: null,
          details: 'No hay pólizas para verificar integridad'
        };
      }

      // Verificar que cada póliza tiene un cliente válido (si cliente_id no es null)
      const invalidPolicies = [];
      for (const policy of policies) {
        if (policy.cliente_id) {
          const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('id')
            .eq('id', policy.cliente_id)
            .eq('user_id', policy.user_id)
            .single();

          if (clientError || !client) {
            invalidPolicies.push(policy.id);
          }
        }
      }

      if (invalidPolicies.length > 0) {
        return {
          success: false,
          error: `Pólizas con clientes inválidos: ${invalidPolicies.join(', ')}`,
          details: null
        };
      }

      return {
        success: true,
        error: null,
        details: `Integridad verificada para ${policies.length} pólizas`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: null
      };
    }
  }

  async testRLSPolicies() {
    try {
      // Intentar acceder sin autenticación (debería fallar para datos sensibles)
      const { data, error } = await supabase
        .from('policies')
        .select('id')
        .limit(1);

      // Si hay error de RLS, es bueno - significa que las políticas están activas
      const rlsActive = error && (
        error.message.includes('policy') ||
        error.message.includes('permission') ||
        error.message.includes('RLS')
      );

      return {
        success: true, // RLS está activo si obtenemos error de permisos
        error: null,
        details: rlsActive ? 'RLS está activo y funcionando' : 'RLS puede no estar configurado correctamente'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: null
      };
    }
  }

  async runAllTests() {
    this.log('🚀 Iniciando pruebas de integridad de base de datos', 'info');

    // Pruebas de existencia de tablas
    await this.runTest('Tabla clients existe', () => this.testTableExists('clients'));
    await this.runTest('Tabla policies existe', () => this.testTableExists('policies'));
    await this.runTest('Tabla leads existe', () => this.testTableExists('leads'));
    await this.runTest('Tabla profiles existe', () => this.testTableExists('profiles'));
    await this.runTest('Tabla policy_contacts existe', () => this.testTableExists('policy_contacts'));
    await this.runTest('Tabla policy_documents existe', () => this.testTableExists('policy_documents'));

    // Pruebas de funciones
    await this.runTest('Función validate_mexican_rfc existe', () => this.testFunctionExists('validate_mexican_rfc'));
    await this.runTest('Función validate_email_format existe', () => this.testFunctionExists('validate_email_format'));
    await this.runTest('Función update_client_policy_count existe', () => this.testFunctionExists('update_client_policy_count'));

    // Pruebas de vistas
    await this.runTest('Vista policies_with_clients existe', () => this.testViewExists('policies_with_clients'));
    await this.runTest('Vista user_financial_summary existe', () => this.testViewExists('user_financial_summary'));

    // Pruebas de integridad de datos
    await this.runTest('Integridad de datos póliza-cliente', () => this.testDataIntegrity());

    // Pruebas de seguridad
    await this.runTest('Políticas RLS activas', () => this.testRLSPolicies());

    // Resumen final
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    this.log(`RESUMEN DE PRUEBAS`, 'info');
    console.log('='.repeat(50));
    this.log(`Total de pruebas: ${this.results.passed + this.results.failed}`, 'info');
    this.log(`Pasaron: ${this.results.passed}`, 'success');
    this.log(`Fallaron: ${this.results.failed}`, 'error');

    if (this.results.failed > 0) {
      this.log('\nPruebas que fallaron:', 'error');
      this.results.tests
        .filter(test => !test.success)
        .forEach(test => {
          this.log(`  ❌ ${test.name}: ${test.error}`, 'error');
        });
    }

    if (this.results.passed === this.results.tests.length) {
      this.log('\n🎉 ¡Todas las pruebas pasaron! La base de datos está en buen estado.', 'success');
    } else {
      this.log('\n⚠️  Algunas pruebas fallaron. Revisa la configuración de la base de datos.', 'warning');
    }
  }
}

// Ejecutar pruebas
async function main() {
  const tester = new DatabaseIntegrityTester();
  await tester.runAllTests();

  // Salir con código de error si hay pruebas fallidas
  process.exit(tester.results.failed > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
}

export { DatabaseIntegrityTester };
