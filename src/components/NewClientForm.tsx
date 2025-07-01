import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Client } from '@/types/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Esquema Zod consistente con el backend
const clientSchema = z.object({
  fullName: z.string().min(3, "El nombre completo es requerido y debe tener al menos 3 caracteres."),
  email: z.string().email("El email no es válido."),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 dígitos."),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La fecha de nacimiento debe ser una fecha válida.",
  }),
  address: z.string().optional().or(z.literal('')),
  responsibleAdvisor: z.string().optional().or(z.literal('')),
});

type NewClientFormData = z.infer<typeof clientSchema>;

interface NewClientFormProps {
    onClientCreated: (newClient: Client) => void;
    onClose: () => void;
}

export const NewClientForm: React.FC<NewClientFormProps> = ({ onClientCreated, onClose }) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewClientFormData>({
        resolver: zodResolver(clientSchema)
    });

    const onSubmit: SubmitHandler<NewClientFormData> = async (data) => {
        setServerError(null);
        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const newClient = await response.json();

            if (!response.ok) {
                // Si el backend envía un array de errores, los procesamos
                if (newClient.errors) {
                    const errorMessages = newClient.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join('; ');
                    throw new Error(errorMessages);
                }
                throw new Error(newClient.message || 'Error desconocido al crear el cliente.');
            }
            
            onClientCreated(newClient);
            onClose();

        } catch (error: any) {
            console.error("Error creating client:", error);
            setServerError(`Error: ${error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-xl font-semibold">Crear Nuevo Cliente</h2>
            
            <div>
                <Label htmlFor="fullName">Nombre Completo <span className="text-red-500">*</span></Label>
                <Input id="fullName" {...register('fullName')} placeholder="Ej. Juan Pérez García" />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input id="email" type="email" {...register('email')} placeholder="Ej. juan.perez@email.com" />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                    <Label htmlFor="phone">Teléfono <span className="text-red-500">*</span></Label>
                    <Input id="phone" {...register('phone')} placeholder="Ej. 55 1234 5678" />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>
            </div>

            <div>
                <Label htmlFor="birthDate">Fecha de Nacimiento <span className="text-red-500">*</span></Label>
                <Input id="birthDate" type="date" {...register('birthDate')} />
                {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>}
            </div>

            <div>
                <Label htmlFor="address">Dirección (Opcional)</Label>
                <Input id="address" {...register('address')} placeholder="Ej. Av. Siempre Viva 123" />
            </div>

            <div>
                <Label htmlFor="responsibleAdvisor">Asesor Responsable (Opcional)</Label>
                <Input id="responsibleAdvisor" {...register('responsibleAdvisor')} placeholder="Ej. Pedro Páramo" />
            </div>

            {serverError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{serverError}</AlertDescription>
                </Alert>
            )}
            
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                </Button>
            </div>
        </form>
    );
}; 