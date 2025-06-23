import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';
import { Calendar, Check, ChevronDown } from 'lucide-react'; // Importar iconos necesarios

// --- Zod Schema Definition (Simplificado) ---
const clientSchema = z.object({
  // 🧾 Datos generales del cliente
  fullName: z.string().min(3, 'Escribe el nombre completo (al menos 3 letras)').max(100),
  rfc: z.string().regex(/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/, 'Revisa el formato del RFC (ej. ABCD123456XYZ)'),
  phone: z.string().regex(/^\+?[0-9\s-()]{10,}$/, 'Escribe un teléfono de 10 dígitos (o más con lada internacional)'),
  email: z.string().email('Escribe un correo válido (ej. nombre@dominio.com)'),
  birthDate: z.string().refine(val => {
    if (!val) return false; // Requerido
    try {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    } catch { return false; }
  }, 'Selecciona una fecha de nacimiento válida (no futura)'), // Hecho requerido
  
  // 📍 Dirección (Simplificada)
  address: z.object({
    state: z.string().min(1, 'Escribe el estado'),
    zipCode: z.string().regex(/^\d{5}$/, 'Escribe el código postal (5 números)'),
  }),

  // 🆔 Documento INE (Opcional)
  ineDocument: z.any().optional(), // Para manejar FileList
  
  // ✅ Consentimientos y Asignación (Mantener / Añadir)
  responsibleAdvisor: z.string().min(1, 'Elige quién atenderá al cliente'),
  dataConsent: z.boolean().refine(val => val === true, 'Es necesario marcar la autorización para usar sus datos'),
  privacyNoticeSigned: z.boolean().refine(val => val === true, 'Es necesario marcar la aceptación del aviso de privacidad'),
  additionalNotes: z.string().optional(),

});

type ClientFormData = z.infer<typeof clientSchema>;

interface NewClientFormProps {
  onSubmit: (data: ClientFormData) => void;
  onClose: () => void;
}

// --- Helper Components Adaptados ---
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-6 first:mt-0 first:border-t-0 first:pt-0">
    <legend className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">{title}</legend>
    {children}
  </fieldset>
);

const InputField: React.FC<{ label: string; name: string; register: any; errors: any; type?: string; placeholder?: string; isOptional?: boolean }> =
  ({ label, name, register, errors, type = 'text', placeholder, isOptional = false }) => {
    const error = name.split('.').reduce((o, i) => o?.[i], errors);
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {!isOptional && <span className="text-red-500">*</span>}
        </label>
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          {...register(name)}
          className={clsx(
            'mt-1 block w-full rounded-md shadow-sm focus:ring-1 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500',
            'border-gray-300 focus:border-primary focus:ring-primary bg-white text-gray-900',
            'dark:border-gray-600 dark:focus:border-primary-dark dark:focus:ring-primary-dark dark:bg-gray-700 dark:text-gray-200',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500'
          )}
        />
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

const CheckboxField: React.FC<{ label: string; name: string; register: any; errors: any; description?: string; isRequired?: boolean }> =
  ({ label, name, register, errors, description, isRequired = false }) => {
    const error = name.split('.').reduce((o, i) => o?.[i], errors);
    return (
      <div className="relative flex items-start">
        <div className="flex h-5 items-center">
          <input
            id={name}
            type="checkbox"
            {...register(name)}
            className={clsx(
                "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
                "dark:border-gray-600 dark:text-primary-dark dark:focus:ring-primary-dark dark:bg-gray-700 dark:checked:bg-primary-dark",
                error && "border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-500"
             )}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={name} className="font-medium text-gray-700 dark:text-gray-200">
            {label} {isRequired && <span className="text-red-500">*</span>}
           </label>
          {description && <p className="text-gray-500 dark:text-gray-400">{description}</p>}
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.message}</p>}
        </div>
      </div>
    );
  };


// --- Form Component Adaptado (Simplificado) ---
export const NewClientForm: React.FC<NewClientFormProps> = ({ onSubmit, onClose }) => {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { // Ajustar valores por defecto al nuevo schema
      dataConsent: false,
      privacyNoticeSigned: false,
    }
  });

  const handleFormSubmit = async (data: ClientFormData) => {
    console.log("Form Data to be sent:", data);
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('La respuesta del servidor no fue exitosa');
      }

      const newClient = await response.json();
      console.log("Cliente guardado en el servidor:", newClient);
      onSubmit(data); // Puedes pasar el cliente completo si lo necesitas
    } catch (error) {
      console.error("Error al guardar el cliente:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

      <FormSection title="Datos Personales Esenciales">
        <InputField label="Nombre Completo" name="fullName" register={register} errors={errors} placeholder="Como aparece en su identificación" />
        <InputField label="RFC" name="rfc" register={register} errors={errors} placeholder="Registro Federal de Contribuyentes" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Teléfono Principal" name="phone" register={register} errors={errors} type="tel" placeholder="Número a 10 dígitos" />
          <InputField label="Correo Electrónico" name="email" register={register} errors={errors} type="email" placeholder="donde recibirá notificaciones" />
        </div>
         <InputField label="Fecha de Nacimiento" name="birthDate" register={register} errors={errors} type="date" />
      </FormSection>

      <FormSection title="📍 Ubicación General">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <InputField label="Estado" name="address.state" register={register} errors={errors} placeholder="Ej: Jalisco" />
           <InputField label="Código Postal" name="address.zipCode" register={register} errors={errors} placeholder="5 números" />
        </div>
      </FormSection>

      <FormSection title="🆔 Documento de Identificación (INE)">
           <div>
             <label htmlFor="ineDocument" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
               Subir archivo del INE (Opcional)
             </label>
             <input
               id="ineDocument"
               type="file"
               {...register('ineDocument')}
               accept=".pdf,.jpg,.jpeg,.png"
               className={clsx(
                 'mt-1 block w-full text-sm text-gray-500 dark:text-gray-400',
                 'file:mr-4 file:py-2 file:px-4',
                 'file:rounded-md file:border-0 file:text-sm file:font-semibold',
                 'file:bg-primary-light file:text-primary dark:file:bg-primary-dark/20 dark:file:text-primary-light',
                 'hover:file:bg-primary-light/80 dark:hover:file:bg-primary-dark/30'
               )}
             />
             {/* Acceder a .message para mostrar el error */}
             {errors.ineDocument && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ineDocument.message?.toString()}</p>}
             <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Sube una imagen o PDF del INE del cliente. Esto puede agilizar futuras gestiones.</p>
           </div>
      </FormSection>

      <FormSection title="🧑‍💼 Gestión Interna y Consentimientos">
        <SelectField 
          label="Asesor Responsable"
          name="responsibleAdvisor"
          control={control}
          errors={errors}
          placeholder="Selecciona un asesor..."
          options={[
            // Opciones de ejemplo - Llenar desde datos reales
            { value: 'Ana López', label: 'Ana López' },
            { value: 'Carlos Marín', label: 'Carlos Marín' },
            { value: 'Otro', label: 'Otro Asesor' },
          ]}
        />
        <InputField 
          label="Notas Adicionales"
          name="additionalNotes"
          register={register}
          errors={errors}
          type="textarea"
          placeholder="Añade comentarios relevantes sobre el cliente..."
          isOptional={true}
        />
        <div className="space-y-3 pt-3">
          <CheckboxField 
             label="Autorización de Manejo de Datos Personales"
             name="dataConsent"
             register={register}
             errors={errors}
             description="El cliente autoriza el tratamiento de sus datos según la normativa."
             isRequired={true}
           />
           <CheckboxField 
             label="Firma/Aceptación de Aviso de Privacidad"
             name="privacyNoticeSigned"
             register={register}
             errors={errors}
             description="El cliente confirma haber leído y aceptado el aviso de privacidad."
             isRequired={true}
           />
        </div>
      </FormSection>

      <div className="flex justify-end gap-4 pt-5 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className={clsx(
              "px-4 py-2 text-sm font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors",
              "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
              "dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800 dark:focus:ring-gray-600"
          )}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
              "inline-flex justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors",
              "bg-primary hover:bg-primary-hover focus:ring-primary",
              "dark:bg-primary-dark dark:hover:bg-primary-hover-dark dark:focus:ring-primary-dark dark:focus:ring-offset-gray-800"
          )}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
        </button>
      </div>
    </form>
  );
};

export default NewClientForm; 