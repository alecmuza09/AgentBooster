import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Lead, LeadData, LeadStatus } from '../types/lead';
import { createLead, updateLead } from '../data/leads';
import { Textarea } from './ui/textarea';

interface NewLeadFormProps {
  onLeadCreated: (newLead: Lead) => void;
  initialData?: Partial<Lead>;
  isEditMode?: boolean;
}

const leadStatuses: LeadStatus[] = ['Nuevo', 'Contactado', 'Cita', 'Propuesta', 'Cerrado', 'Frenado'];

export const NewLeadForm: React.FC<NewLeadFormProps> = ({ onLeadCreated, initialData, isEditMode }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<LeadData>({
    defaultValues: initialData ? {
      name: initialData.name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      status: (initialData.status as LeadStatus) || 'Nuevo',
      source: initialData.source || '',
      potentialValue: initialData.potentialValue || undefined,
      notes: initialData.notes || '',
    } : {}
  });

  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name || '');
      setValue('email', initialData.email || '');
      setValue('phone', initialData.phone || '');
      setValue('status', (initialData.status as LeadStatus) || 'Nuevo');
      setValue('source', initialData.source || '');
      setValue('potentialValue', initialData.potentialValue || undefined);
      setValue('notes', initialData.notes || '');
    }
  }, [initialData, setValue]);

  const onSubmit: SubmitHandler<LeadData> = async (formData) => {
    try {
      const potentialValue = formData.potentialValue ? parseFloat(String(formData.potentialValue)) : undefined;
      if (isEditMode && initialData && initialData.id) {
        const updatedLead = await updateLead(initialData.id, {
          ...formData,
          potentialValue: potentialValue,
        });
        onLeadCreated(updatedLead);
      } else {
        const newLead = await createLead({
          ...formData,
          potentialValue: potentialValue,
          status: formData.status || 'Nuevo',
        });
        onLeadCreated(newLead);
        reset();
      }
    } catch (error) {
      console.error('Error al crear/actualizar el lead:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre Completo</Label>
        <Input id="name" {...register('name')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input id="email" type="email" {...register('email')} />
        </div>
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" {...register('phone', { required: 'El teléfono es obligatorio' })} />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
          <div>
              <Label htmlFor="status">Estado</Label>
              <Select defaultValue={initialData?.status || 'Nuevo'} onValueChange={(value) => setValue('status', value as LeadStatus)}>
                  <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                      {leadStatuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
          <div>
            <Label htmlFor="potentialValue">Valor Potencial (USD)</Label>
            <Input id="potentialValue" type="number" {...register('potentialValue')} />
          </div>
      </div>
      <div>
        <Label htmlFor="source">Fuente del Lead</Label>
        <Input id="source" {...register('source')} placeholder="Ej: Referido, Página Web..."/>
      </div>
       <div>
        <Label htmlFor="notes">Notas Adicionales</Label>
        <Textarea id="notes" {...register('notes')} />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEditMode ? 'Actualizando...' : 'Guardando...') : (isEditMode ? 'Actualizar Lead' : 'Guardar Lead')}
        </Button>
      </div>
    </form>
  );
};

export default NewLeadForm; 