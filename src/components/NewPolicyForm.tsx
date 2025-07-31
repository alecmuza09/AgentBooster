import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Policy, Ramo, FormaDePago, Moneda, PolicyStatus, ConductoDePago } from '../types/policy';
import { createPolicy } from '../data/policies';
import { Info } from 'lucide-react';

// Tooltip simple
const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <span className="ml-1 cursor-pointer group relative">
    <Info className="w-4 h-4 text-blue-500 inline" />
    <span className="absolute left-6 top-0 z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
      {text}
    </span>
  </span>
);

// Campos de contacto con tooltips y campos opcionales
const ContactFields: React.FC<{
  control: any;
  fieldName: 'contratante' | 'asegurado' | 'dueñoFinal' | 'contactoPago';
  isRFCRequired?: boolean;
  showBirthDate?: boolean;
  showMunicipio?: boolean;
  tooltip?: string;
  errors?: any;
}> = ({ control, fieldName, isRFCRequired, showBirthDate, showMunicipio, tooltip, errors }) => (
  <div className="space-y-2 border p-3 rounded-md">
    <div className="flex items-center gap-2 mb-2">
      <h4 className="font-semibold capitalize">{fieldName.replace(/([A-Z])/g, ' $1')}</h4>
      {tooltip && <Tooltip text={tooltip} />}
    </div>
    <Controller name={`${fieldName}.nombre`} control={control} render={({ field }) => <Input {...field} placeholder="Nombre" required={fieldName === 'contratante' || fieldName === 'asegurado'} className={errors?.[fieldName]?.nombre ? 'border-red-500' : ''} />} />
    {errors?.[fieldName]?.nombre && <span className="text-red-500 text-xs">El nombre es obligatorio</span>}
    <Controller name={`${fieldName}.rfc`} control={control} render={({ field }) => <Input {...field} placeholder="RFC" />} />
    <Controller name={`${fieldName}.correo`} control={control} render={({ field }) => <Input {...field} type="email" placeholder="Correo electrónico" />} />
    <Controller name={`${fieldName}.direccion`} control={control} render={({ field }) => <Input {...field} placeholder="Dirección (opcional)" />} />
    {showBirthDate && <Controller name={`${fieldName}.fechanacimiento`} control={control} render={({ field }) => <Input {...field} type="date" placeholder="Fecha de nacimiento (opcional)" />} />}
    {showMunicipio && <Controller name={`${fieldName}.municipio`} control={control} render={({ field }) => <Input {...field} placeholder="Municipio (opcional)" />} />}
    <Controller name={`${fieldName}.telefono`} control={control} render={({ field }) => <Input {...field} placeholder="Teléfono" />} />
  </div>
);

export const NewPolicyForm: React.FC<{ onPolicyCreated: (policy: Policy) => void }> = ({ onPolicyCreated }) => {
  const { control, register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<any>({
    defaultValues: {
      contratante: { nombre: '', rfc: '', correo: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' },
      asegurado: { nombre: '', rfc: '', correo: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' },
      dueñoFinal: { nombre: '', rfc: '', correo: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' },
      contactosPago: [
        { nombre: '', rfc: '', correo: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' }
      ],
      policyNumber: '',
      ramo: '',
      subproducto: '',
      aseguradora: '',
      sumaAsegurada: 0,
      formaDePago: '',
      conductoDePago: '',
      moneda: '',
      premiumAmount: 0,
      fechaPagoActual: '',
      vigenciaPeriodo: { inicio: '', fin: '' },
      vigenciaTotal: { inicio: '', fin: '' },
      terminoPagos: '',
      comentarios: '',
    }
  });

  // Watch para copiar datos
  const contratanteData = watch('contratante');

  const handleCopyContratante = (checked: boolean, role: 'asegurado' | 'dueñoFinal') => {
    if (checked) {
      setValue(role, contratanteData);
    } else {
      setValue(role, { nombre: '', rfc: '', correo: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' });
    }
  };

  const handleCopyToPaymentContact = (checked: boolean, index: number) => {
    if (checked) {
      setValue(`contactosPago.${index}`, contratanteData);
    } else {
      setValue(`contactosPago.${index}`, { nombre: '', rfc: '', correo: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' });
    }
  };

  const addPaymentContact = () => {
    const currentContacts = watch('contactosPago') || [];
    setValue('contactosPago', [...currentContacts, { nombre: '', rfc: '', correo: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' }]);
  };

  const removePaymentContact = (index: number) => {
    const currentContacts = watch('contactosPago') || [];
    if (currentContacts.length > 1) {
      setValue('contactosPago', currentContacts.filter((_, i) => i !== index));
    }
  };

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      // Filtrar contactos de pago vacíos
      const contactosPagoFiltrados = data.contactosPago?.filter((contacto: any) => 
        contacto.nombre || contacto.rfc || contacto.correo || contacto.telefono
      ) || [];

      const policyToSave = {
        ...data,
        contactosPago: contactosPagoFiltrados,
        status: 'active', // Por defecto
      };
      const newPolicy = await createPolicy(policyToSave);
      onPolicyCreated(newPolicy);
    } catch (error) {
      console.error('Failed to create policy:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Contratante */}
      <ContactFields control={control} fieldName="contratante" isRFCRequired tooltip="Persona que firma la póliza y asume la obligación de pago. El RFC es obligatorio." showBirthDate showMunicipio errors={errors} />

      {/* Asegurado */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox id="copy-to-asegurado" onCheckedChange={(c) => handleCopyContratante(c as boolean, 'asegurado')} />
          <label htmlFor="copy-to-asegurado">El asegurado es el mismo que el contratante</label>
        </div>
        <ContactFields control={control} fieldName="asegurado" tooltip="Persona que está protegida por la póliza. El RFC es opcional (especialmente para menores de edad)." showBirthDate showMunicipio errors={errors} />
      </div>

      {/* Dueño Final / Responsable */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox id="copy-to-dueno" onCheckedChange={(c) => handleCopyContratante(c as boolean, 'dueñoFinal')} />
          <label htmlFor="copy-to-dueno">El dueño final es el mismo que el contratante</label>
        </div>
        <ContactFields control={control} fieldName="dueñoFinal" tooltip="Persona que toma decisiones sobre la póliza. Puede ser diferente al contratante o asegurado." showBirthDate showMunicipio errors={errors} />
      </div>

      {/* Contactos para pago - Múltiples */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Contactos para Pago</h3>
          <Button type="button" variant="outline" size="sm" onClick={addPaymentContact}>
            + Agregar Contacto
          </Button>
        </div>
        
        {watch('contactosPago')?.map((_, index) => (
          <div key={index} className="mb-4 border p-4 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`copy-to-pago-${index}`} 
                  onCheckedChange={(c) => handleCopyToPaymentContact(c as boolean, index)} 
                />
                <label htmlFor={`copy-to-pago-${index}`}>
                  El contacto {index + 1} es el mismo que el contratante
                </label>
              </div>
              {watch('contactosPago')?.length > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removePaymentContact(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <Controller 
                name={`contactosPago.${index}.nombre`} 
                control={control} 
                render={({ field }) => <Input {...field} placeholder="Nombre" />} 
              />
              <Controller 
                name={`contactosPago.${index}.rfc`} 
                control={control} 
                render={({ field }) => <Input {...field} placeholder="RFC" />} 
              />
              <Controller 
                name={`contactosPago.${index}.correo`} 
                control={control} 
                render={({ field }) => <Input {...field} type="email" placeholder="Correo electrónico" />} 
              />
              <Controller 
                name={`contactosPago.${index}.direccion`} 
                control={control} 
                render={({ field }) => <Input {...field} placeholder="Dirección (opcional)" />} 
              />
              <Controller 
                name={`contactosPago.${index}.telefono`} 
                control={control} 
                render={({ field }) => <Input {...field} placeholder="Teléfono" />} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* --- DATOS DE LA PÓLIZA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
        <div>
          <Label htmlFor="policyNumber">Número de póliza</Label>
          <Input id="policyNumber" {...register('policyNumber', { required: true })} />
          {errors.policyNumber && <span className="text-red-500 text-xs">El número de póliza es obligatorio</span>}
        </div>
        <div>
          <Label htmlFor="ramo">Ramo <Tooltip text="Categoría principal del seguro (Vida, Gastos Médicos, Autos, Daños, etc.)" /></Label>
          <Controller
            name="ramo"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Selecciona un ramo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vida">Vida</SelectItem>
                  <SelectItem value="Gastos Médicos">Gastos Médicos</SelectItem>
                  <SelectItem value="Autos">Autos</SelectItem>
                  <SelectItem value="Daños">Daños</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="subproducto">Producto específico</Label>
          <Input id="subproducto" {...register('subproducto')} placeholder="Ej: GMM, Vida Entera, RC, etc." />
        </div>
        <div>
          <Label htmlFor="aseguradora">Aseguradora</Label>
          <Input id="aseguradora" {...register('aseguradora')} />
        </div>
        <div>
          <Label htmlFor="sumaAsegurada">Suma asegurada</Label>
          <Input id="sumaAsegurada" type="number" step="any" {...register('sumaAsegurada')} />
        </div>
        <div>
          <Label htmlFor="formaDePago">Forma de pago</Label>
          <Controller
            name="formaDePago"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Selecciona la forma de pago" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Anual">Anual</SelectItem>
                  <SelectItem value="Semestral">Semestral</SelectItem>
                  <SelectItem value="Trimestral">Trimestral</SelectItem>
                  <SelectItem value="Mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="conductoDePago">Conducto de pago</Label>
          <Controller
            name="conductoDePago"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Selecciona el conducto de pago" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agente">Agente</SelectItem>
                  <SelectItem value="Domiciliado">Domiciliado</SelectItem>
                  <SelectItem value="Tarjeta">Tarjeta de crédito</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="moneda">Moneda</Label>
          <Controller
            name="moneda"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Selecciona la moneda" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">Peso (MXN)</SelectItem>
                  <SelectItem value="USD">Dólar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="UDIs">UDIs</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="premiumAmount">Prima/Pago</Label>
          <Input id="premiumAmount" type="number" step="any" {...register('premiumAmount')} />
        </div>
        <div>
          <Label htmlFor="comprobantePago">Comprobante de Pago</Label>
          <Input 
            id="comprobantePago" 
            type="file" 
            accept=".pdf,.jpg,.jpeg,.png"
            {...register('comprobantePago')} 
          />
          <p className="text-xs text-gray-500 mt-1">
            {watch('conductoDePago') === 'Domiciliado' ? 'Obligatorio para pólizas domiciliadas' : 'Opcional'}
          </p>
        </div>
      </div>

      {/* Fechas críticas de la póliza */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
        <div>
          <Label htmlFor="vigenciaPeriodoInicio">Fecha de inicio de la póliza</Label>
          <Input id="vigenciaPeriodoInicio" type="date" {...register('vigenciaPeriodo.inicio')} />
        </div>
        <div>
          <Label htmlFor="vigenciaPeriodoFin">Fecha de fin de la póliza</Label>
          <Input id="vigenciaPeriodoFin" type="date" {...register('vigenciaPeriodo.fin')} />
        </div>
        <div>
          <Label htmlFor="terminoPagos">Fecha de término de pagos</Label>
          <Input id="terminoPagos" type="date" {...register('terminoPagos')} />
        </div>
        <div>
          <Label htmlFor="fechaPagoActual">Fecha de pago actual</Label>
          <Input id="fechaPagoActual" type="date" {...register('fechaPagoActual')} />
        </div>
        <div>
          <Label htmlFor="vigenciaTotalFin">Fecha de vigencia total</Label>
          <Input id="vigenciaTotalFin" type="date" {...register('vigenciaTotal.fin')} />
        </div>
      </div>

      {/* Comentarios y Justificación */}
      <div className="border p-4 rounded-md bg-gray-50">
        <Label htmlFor="comentarios">Comentarios y Justificación del Plan</Label>
        <textarea 
          id="comentarios" 
          {...register('comentarios')} 
          className="w-full mt-2 p-3 border rounded-md resize-vertical min-h-[100px]"
          placeholder="Ej: Plan 'Abrazo Eterno' - Cliente busca cobertura integral para familia. Incluir justificación del plan seleccionado..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Describe la justificación del plan seleccionado y cualquier información adicional relevante.
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Crear Póliza'}</Button>
    </form>
  );
};

export default NewPolicyForm;
