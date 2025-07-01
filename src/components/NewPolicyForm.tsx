import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Client } from '@/types/client';
import { Policy } from '@/types/policy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Definiciones de Componentes Auxiliares (Mover al inicio) ---

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-6 first:mt-0 first:border-t-0 first:pt-0">
        <legend className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">{title}</legend>
        {children}
    </fieldset>
);

const InputField: React.FC<{ label: string; name: string; register: any; errors: any; type?: string; placeholder?: string; step?: string; isOptional?: boolean }> =
    ({ label, name, register, errors, type = 'text', placeholder, step, isOptional = false }) => {
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
                    step={step}
                    {...register(name)}
                    className={cn(
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
                            className={cn(
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

const CheckboxField: React.FC<{ label: string; name: string; register: any; errors: any; description?: string; isRequired?: boolean; className?: string }> =
    ({ label, name, register, errors, description, isRequired = false, className }) => {
        const error = name.split('.').reduce((o, i) => o?.[i], errors);
        return (
            <div className={cn("relative flex items-start", className)}>
                <div className="flex h-5 items-center">
                    <input
                        id={name}
                        type="checkbox"
                        {...register(name)}
                        className={cn(
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
                    {description && <p className="text-gray-500 dark:text-gray-400 text-xs">{description}</p>}
                    {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.message}</p>}
                </div>
            </div>
        );
    };

// --- Zod Schema Definition para Póliza ---

// Definir arrays con los valores de los tipos para z.enum
const paymentFormValues: [string, ...string[]] = ['monthly', 'quarterly', 'annual', 'single'];
const paymentMethodValues: [string, ...string[]] = ['direct_debit', 'card', 'transfer', 'cash'];

// Sub-schema opcional para el asegurado
const insuredSchema = z.object({
    fullName: z.string().min(3, 'Nombre requerido').max(100),
    birthDate: z.string().min(1, 'Fecha de nacimiento requerida'),
    // Añadir más campos si son necesarios (RFC, dirección?)
}).optional();

const policySchema = z.object({
  clientId: z.string().min(1, 'Debes seleccionar un cliente'),
  policyNumber: z.string().min(3, 'Número de póliza requerido').max(50),
  policyType: z.string().min(1, 'Tipo de seguro requerido'),
  insuranceCompany: z.string().min(1, 'Aseguradora requerida'),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().min(1, 'Fecha de fin requerida'),
  premiumAmount: z.coerce.number().positive('La prima debe ser un valor positivo'),
  paymentForm: z.enum(paymentFormValues),
  paymentMethod: z.enum(paymentMethodValues),
  isInsuredDifferent: z.boolean().default(false),
  insuredDetails: insuredSchema,
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
    message: "La fecha de fin no puede ser anterior a la de inicio",
    path: ["endDate"],
}).refine(data => !data.isInsuredDifferent || data.insuredDetails, {
    message: "Debes completar los datos del asegurado",
    path: ["insuredDetails.fullName"],
});

// Definir opciones manualmente para SelectField
const paymentFormOptions: { value: string; label: string }[] = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'annual', label: 'Anual' },
  { value: 'single', label: 'Pago Único' },
];
const paymentMethodOptions: { value: string; label: string }[] = [
  { value: 'direct_debit', label: 'Domiciliación' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'cash', label: 'Efectivo' },
];

type PolicyFormData = z.infer<typeof policySchema>;

interface NewPolicyFormProps {
  onPolicyCreated: (newPolicy: Policy) => void;
  onClose: () => void;
}

// --- Client Search Combobox ---
const ClientCombobox = ({ control, errors }: { control: any, errors: any }) => {
    const [open, setOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch('/api/clients');
                if (!response.ok) throw new Error('Failed to fetch clients');
                const data = await response.json();
                setClients(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchClients();
    }, []);

    const filteredClients = searchTerm
        ? clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : clients;
    
    return (
        <div>
            <Label htmlFor="clientId">Cliente Contratante <span className="text-red-500">*</span></Label>
            <Controller
                name="clientId"
                control={control}
                render={({ field }) => (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between mt-1"
                            >
                                {field.value ? clients.find(c => c.id === field.value)?.name : "Selecciona un cliente..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Buscar cliente..." onValueChange={setSearchTerm} />
                                <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                                <CommandGroup>
                                    {filteredClients.map((client) => (
                                        <CommandItem
                                            key={client.id}
                                            value={client.id}
                                            onSelect={(currentValue) => {
                                                field.onChange(currentValue === field.value ? "" : currentValue);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", field.value === client.id ? "opacity-100" : "opacity-0")} />
                                            {client.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            />
            {errors.clientId && <p className="mt-1 text-sm text-red-500">{errors.clientId.message}</p>}
        </div>
    );
};

// --- Form Component ---
export const NewPolicyForm: React.FC<NewPolicyFormProps> = ({ onPolicyCreated, onClose }) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<PolicyFormData>({
        resolver: zodResolver(policySchema),
        defaultValues: { isInsuredDifferent: false, paymentForm: 'monthly', paymentMethod: 'direct_debit' }
    });

    const isInsuredDifferent = watch('isInsuredDifferent');

    const handleFormSubmit = async (data: PolicyFormData) => {
        setServerError(null);
        try {
            const response = await fetch('/api/policies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear la póliza');
            }
            const newPolicy = await response.json();
            onPolicyCreated(newPolicy);
            onClose();
        } catch (error: any) {
            console.error("Error creating policy:", error);
            setServerError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <ClientCombobox control={control} errors={errors} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="policyNumber">Número de Póliza <span className="text-red-500">*</span></Label><Input id="policyNumber" {...register("policyNumber")} />{errors.policyNumber && <p className="text-red-500 text-sm mt-1">{errors.policyNumber.message}</p>}</div>
                <div><Label htmlFor="insuranceCompany">Aseguradora <span className="text-red-500">*</span></Label><Input id="insuranceCompany" {...register("insuranceCompany")} />{errors.insuranceCompany && <p className="text-red-500 text-sm mt-1">{errors.insuranceCompany.message}</p>}</div>
            </div>

            <div><Label htmlFor="policyType">Tipo de Seguro <span className="text-red-500">*</span></Label><Input id="policyType" {...register("policyType")} />{errors.policyType && <p className="text-red-500 text-sm mt-1">{errors.policyType.message}</p>}</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="startDate">Fecha de Inicio <span className="text-red-500">*</span></Label><Input id="startDate" type="date" {...register("startDate")} />{errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}</div>
                <div><Label htmlFor="endDate">Fecha de Fin <span className="text-red-500">*</span></Label><Input id="endDate" type="date" {...register("endDate")} />{errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}</div>
            </div>

            <div><Label htmlFor="premiumAmount">Monto de la Prima <span className="text-red-500">*</span></Label><Input id="premiumAmount" type="number" step="0.01" {...register("premiumAmount")} />{errors.premiumAmount && <p className="text-red-500 text-sm mt-1">{errors.premiumAmount.message}</p>}</div>

            {/* Opciones de Pago (simplificado, se podrían usar Select de shadcn) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Forma de Pago</Label><select {...register("paymentForm")} className="input w-full mt-1"><option value="monthly">Mensual</option><option value="quarterly">Trimestral</option><option value="annual">Anual</option><option value="single">Pago Único</option></select></div>
                <div><Label>Método de Pago</Label><select {...register("paymentMethod")} className="input w-full mt-1"><option value="direct_debit">Domiciliación</option><option value="card">Tarjeta</option><option value="transfer">Transferencia</option><option value="cash">Efectivo</option></select></div>
            </div>

            <div className="flex items-center space-x-2">
                <Controller name="isInsuredDifferent" control={control} render={({ field }) => (
                    <Checkbox id="isInsuredDifferent" checked={field.value} onCheckedChange={field.onChange} />
                )} />
                <Label htmlFor="isInsuredDifferent">El asegurado es diferente al contratante</Label>
            </div>

            {isInsuredDifferent && (
                <div className="p-4 border rounded-md space-y-4">
                    <h3 className="font-semibold">Datos del Asegurado</h3>
                    <div><Label htmlFor="insuredName">Nombre Completo <span className="text-red-500">*</span></Label><Input id="insuredName" {...register("insuredDetails.fullName")} />{errors.insuredDetails?.fullName && <p className="text-red-500 text-sm mt-1">{errors.insuredDetails.fullName.message}</p>}</div>
                    <div><Label htmlFor="insuredBirthDate">Fecha de Nacimiento <span className="text-red-500">*</span></Label><Input id="insuredBirthDate" type="date" {...register("insuredDetails.birthDate")} />{errors.insuredDetails?.birthDate && <p className="text-red-500 text-sm mt-1">{errors.insuredDetails.birthDate.message}</p>}</div>
                </div>
            )}
            
            {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
            
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Crear Póliza'}</Button>
            </div>
        </form>
    );
};

export default NewPolicyForm;

// Añadir Mapeo de Enums a Labels (para visualización si es necesario)
// Ejemplo:
// const paymentFormLabels: Record<PaymentForm, string> = {
//    monthly: 'Mensual',
//    quarterly: 'Trimestral',
//    annual: 'Anual',
//    single: 'Pago Único'
// };
// const paymentMethodLabels: Record<PaymentMethod, string> = {
//    direct_debit: 'Domiciliación',
//    card: 'Tarjeta',
//    transfer: 'Transferencia',
//    cash: 'Efectivo'
// }; 