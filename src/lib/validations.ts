import { supabase } from '../supabaseClient';
import { ValidationResult, RFCValidation } from '../types/client';

/**
 * Valida un RFC mexicano usando la función de PostgreSQL
 */
export const validateMexicanRFC = async (rfc: string): Promise<RFCValidation> => {
  try {
    if (!rfc || rfc.trim().length === 0) {
      return {
        isValid: false,
        errors: ['El RFC es requerido'],
        type: 'invalid'
      };
    }

    const rfcUpper = rfc.toUpperCase().trim();

    // Validación básica de formato
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfcRegex.test(rfcUpper)) {
      return {
        isValid: false,
        errors: ['Formato de RFC inválido. Debe tener 12-13 caracteres: 3-4 letras + 6 dígitos + 3 caracteres alfanuméricos'],
        type: 'invalid'
      };
    }

    // Determinar tipo
    const isPersonaFisica = rfcUpper.length === 13;
    const isPersonaMoral = rfcUpper.length === 12;

    if (!isPersonaFisica && !isPersonaMoral) {
      return {
        isValid: false,
        errors: ['Longitud de RFC inválida'],
        type: 'invalid'
      };
    }

    // Si tenemos conexión a Supabase, usar la función de PostgreSQL
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase.rpc('validate_mexican_rfc', {
        rfc: rfcUpper
      });

      if (error) {
        console.warn('Error calling PostgreSQL validation function:', error);
        // Fallback a validación local
      } else if (data === false) {
        return {
          isValid: false,
          errors: ['RFC con formato inválido'],
          type: 'invalid'
        };
      }
    }

    return {
      isValid: true,
      errors: [],
      type: isPersonaFisica ? 'persona_fisica' : 'persona_moral'
    };

  } catch (error) {
    console.error('Error validating RFC:', error);
    return {
      isValid: false,
      errors: ['Error al validar RFC'],
      type: 'invalid'
    };
  }
};

/**
 * Valida un formato de email
 */
export const validateEmail = async (email: string): Promise<ValidationResult> => {
  try {
    if (!email || email.trim().length === 0) {
      return {
        isValid: false,
        errors: ['El email es requerido']
      };
    }

    const emailLower = email.toLowerCase().trim();

    // Validación básica de formato
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(emailLower)) {
      return {
        isValid: false,
        errors: ['Formato de email inválido']
      };
    }

    // Si tenemos conexión a Supabase, usar la función de PostgreSQL
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase.rpc('validate_email_format', {
        email: emailLower
      });

      if (error) {
        console.warn('Error calling PostgreSQL validation function:', error);
        // Fallback a validación local
      } else if (data === false) {
        return {
          isValid: false,
          errors: ['Formato de email inválido']
        };
      }
    }

    return {
      isValid: true,
      errors: []
    };

  } catch (error) {
    console.error('Error validating email:', error);
    return {
      isValid: false,
      errors: ['Error al validar email']
    };
  }
};

/**
 * Valida datos de cliente antes de guardar
 */
export const validateClientData = async (clientData: {
  name?: string;
  rfc?: string;
  email?: string;
  phone?: string;
}): Promise<ValidationResult> => {
  const errors: string[] = [];

  // Validar nombre
  if (!clientData.name || clientData.name.trim().length === 0) {
    errors.push('El nombre es requerido');
  } else if (clientData.name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  // Validar RFC si está presente
  if (clientData.rfc && clientData.rfc.trim().length > 0) {
    const rfcValidation = await validateMexicanRFC(clientData.rfc);
    if (!rfcValidation.isValid) {
      errors.push(...rfcValidation.errors);
    }
  }

  // Validar email si está presente
  if (clientData.email && clientData.email.trim().length > 0) {
    const emailValidation = await validateEmail(clientData.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
  }

  // Validar teléfono (formato básico mexicano)
  if (clientData.phone && clientData.phone.trim().length > 0) {
    const phoneRegex = /^(\+?52)?[\s\-\.]?(\d{3})[\s\-\.]?(\d{3})[\s\-\.]?(\d{4})$/;
    if (!phoneRegex.test(clientData.phone.replace(/\s+/g, ''))) {
      errors.push('Formato de teléfono inválido. Use formato: +52 XXX XXX XXXX o 55 XXXX XXXX');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida datos de póliza antes de guardar
 */
export const validatePolicyData = async (policyData: {
  policyNumber?: string;
  aseguradora?: string;
  ramo?: string;
  primaNeta?: number;
  total?: number;
  sumaAsegurada?: number;
}): Promise<ValidationResult> => {
  const errors: string[] = [];

  // Validar número de póliza
  if (!policyData.policyNumber || policyData.policyNumber.trim().length === 0) {
    errors.push('El número de póliza es requerido');
  }

  // Validar aseguradora
  if (!policyData.aseguradora || policyData.aseguradora.trim().length === 0) {
    errors.push('La aseguradora es requerida');
  }

  // Validar ramo
  if (!policyData.ramo || policyData.ramo.trim().length === 0) {
    errors.push('El ramo es requerido');
  }

  // Validar montos
  if (policyData.primaNeta !== undefined && policyData.primaNeta <= 0) {
    errors.push('La prima neta debe ser mayor a 0');
  }

  if (policyData.total !== undefined && policyData.total <= 0) {
    errors.push('El total debe ser mayor a 0');
  }

  if (policyData.sumaAsegurada !== undefined && policyData.sumaAsegurada <= 0) {
    errors.push('La suma asegurada debe ser mayor a 0');
  }

  // Validar que total >= prima neta
  if (policyData.total !== undefined && policyData.primaNeta !== undefined) {
    if (policyData.total < policyData.primaNeta) {
      errors.push('El total no puede ser menor a la prima neta');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
