import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';
import { LeadStatus, LeadTimelineEntry, Lead, InterestLevel } from '../types/lead';
import { formatISO } from 'date-fns';
import { AlertCircle } from 'lucide-react';

// Mover leadStatusConfig aquí para que esté disponible globalmente en el archivo
const leadStatusConfig: Record<LeadStatus, { label: string; /* icon?: React.ElementType; */ colorClasses?: string }> = {
    'No Contactado': { label: 'No Contactado' },
    'Contactado': { label: 'Contactado' },
    'Cita Agendada': { label: 'Cita Agendada' },
    'Propuesta Trabajada': { label: 'Propuesta Trabajada' },
    'Convertido': { label: 'Convertido' },
    'Perdido': { label: 'Perdido' },
  };

// --- Componentes Auxiliares (Reutilizar o adaptar de NewClientForm/NewPolicyForm) ---
// Asumimos que InputField, SelectField, FormSection están disponibles o se importan
// Si no, necesitaríamos definirlos aquí o importarlos globalmente.

// Para este ejemplo, los copiaré y adaptaré simplificadamente.
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-6 first:mt-0 first:border-t-0 first:pt-0">
        <legend className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">{title}</legend>
        {children}
    </fieldset>
);

const InputField: React.FC<{ label: string; name: string; register: any; errors: any; type?: string; placeholder?: string; isOptional?: boolean; as?: 'input' | 'textarea' }> = 
    ({ label, name, register, errors, type = 'text', placeholder, isOptional = false, as = 'input' }) => {
    const error = name.split('.').reduce((o, i) => o?.[i], errors);
    const commonProps = {
      id: name,
      placeholder: placeholder,
      ...register(name),
      className: clsx(
        'mt-1 block w-full rounded-md shadow-sm focus:ring-1 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500',
        'border-gray-300 focus:border-primary focus:ring-primary bg-white text-gray-900',
        'dark:border-gray-600 dark:focus:border-primary-dark dark:focus:ring-primary-dark dark:bg-gray-700 dark:text-gray-200',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500'
      )
    };
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {!isOptional && <span className="text-red-500">*</span>}
            </label>
            {as === 'textarea' ? (
                <textarea {...commonProps} rows={3} />
            ) : (
                <input type={type} {...commonProps} />
            )}
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.message}</p>}
        </div>
    );
};

const SelectField: React.FC<{ label: string; name: string; control: any; errors: any; options: { value: string; label: string }[]; placeholder?: string; isOptional?: boolean }> = 
({ label, name, control, errors, options, placeholder, isOptional = false }) => {
    const error = name.split('.').reduce((o, i) => o?.[i], errors);
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {!isOptional && <span className="text-red-500">*</span>}
            </label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <select
                        id={name}
                        {...field}
                        className={clsx(
                            'mt-1 block w-full rounded-md shadow-sm focus:ring-1 sm:text-sm bg-white',
                            'border-gray-300 focus:border-primary focus:ring-primary',
                            'dark:border-gray-600 dark:focus:border-primary-dark dark:focus:ring-primary-dark dark:bg-gray-700 dark:text-gray-200',
                            error && 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500'
                        )}
                    >
                        {placeholder && <option value="">{placeholder}</option>}
                        {options.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                )}
            />
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.message}</p>}
        </div>
    );
};

// --- Zod Schema para Nuevo Prospecto ---
const newLeadSchema = z.object({
    name: z.string().min(3, 'El nombre completo es requerido (mínimo 3 caracteres).'),
    email: z.string().email('Debe ser un email válido.').optional().or(z.literal('')),
    phone: z.string().optional(),
    source: z.string().optional(),
    potential_value: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number({ invalid_type_error: 'Debe ser un número' }).positive('Debe ser un número positivo').optional()
    ),
    interest_level: z.preprocess(
        (val) => (val === '' ? undefined : val),
        z.enum(['Bajo', 'Medio', 'Alto']).optional()
    ),
    notes: z.string().optional(),
});

type NewLeadFormData = z.infer<typeof newLeadSchema>;

interface NewLeadFormProps {
  onLeadCreated: (newLead: Lead) => void;
  onClose: () => void;
}

// --- Componente Principal del Formulario ---
export const NewLeadForm: React.FC<NewLeadFormProps> = ({ onLeadCreated, onClose }) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<NewLeadFormData>({
        resolver: zodResolver(newLeadSchema),
    });

    const handleFormSubmit = async (formData: NewLeadFormData) => {
        setServerError(null);
        try {
            const response = await fetch('/api/prospects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const newLeadData = await response.json();

            if (!response.ok) {
                throw new Error(newLeadData.message || 'Error al crear el prospecto');
            }

            onLeadCreated(newLeadData);
            onClose();
        } catch (error: any) {
            setServerError(error.message);
        }
    };

    const exampleAdvisors = [
        { id: 'ana_lopez', name: 'Ana López' },
        { id: 'carlos_marin', name: 'Carlos Marín' },
        { id: 'otro', name: 'Otro Asesor' },
    ];

    const interestLevelOptions: { value: InterestLevel; label: string }[] = [
        { value: 'Bajo', label: 'Bajo' },
        { value: 'Medio', label: 'Medio' },
        { value: 'Alto', label: 'Alto' },
    ];

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormSection title="Información de Contacto">
                <InputField label="Nombre Completo" name="name" register={register} errors={errors} placeholder="Ej: Laura Martínez Vega" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Email" name="email" type="email" register={register} errors={errors} placeholder="ejemplo@correo.com" isOptional={true} />
                    <InputField label="Teléfono" name="phone" type="tel" register={register} errors={errors} placeholder="+52 55 1234 5678" isOptional={true} />
                </div>
            </FormSection>

            <FormSection title="Detalles del Prospecto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField 
                        label="Fuente del Prospecto" 
                        name="source" 
                        register={register} 
                        errors={errors} 
                        placeholder="Ej: Referido, Campaña Facebook" 
                        isOptional={true} 
                    />
                </div>
            </FormSection>

            <FormSection title="Información Adicional (Opcional)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Valor Potencial Estimado ($)" name="potential_value" type="number" register={register} errors={errors} placeholder="Ej: 25000" isOptional={true} />
                    <SelectField 
                        label="Nivel de Interés" 
                        name="interest_level" 
                        control={control} 
                        errors={errors} 
                        options={interestLevelOptions} 
                        placeholder="Seleccionar nivel..." 
                        isOptional={true} 
                    />
                </div>
                <InputField 
                    label="Nota Inicial" 
                    name="notes" 
                    as="textarea" 
                    register={register} 
                    errors={errors} 
                    placeholder="Añade un comentario o contexto inicial sobre el prospecto..." 
                    isOptional={true} 
                />
            </FormSection>

            {serverError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">
                    <AlertCircle className="w-5 h-5" />
                    <p>{serverError}</p>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary px-4 py-2 flex items-center"
                >
                    {isSubmitting ? 'Guardando...' : 'Guardar Prospecto'}
                </button>
                <button
                    type="reset"
                    onClick={onClose}
                    className="btn-secondary px-4 py-2 flex items-center"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default NewLeadForm; 