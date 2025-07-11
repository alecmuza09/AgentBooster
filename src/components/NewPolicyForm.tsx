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
    <Controller name={`${fieldName}.nombre`} control={control} render={({ field }) => <Input {...field} placeholder="Nombre" required className={errors?.[fieldName]?.nombre ? 'border-red-500' : ''} />} />
    {errors?.[fieldName]?.nombre && <span className="text-red-500 text-xs">El nombre es obligatorio</span>}
    <Controller name={`${fieldName}.rfc`} control={control} render={({ field }) => <Input {...field} placeholder="RFC" required={isRFCRequired} className={errors?.[fieldName]?.rfc ? 'border-red-500' : ''} />} />
    {errors?.[fieldName]?.rfc && <span className="text-red-500 text-xs">El RFC es obligatorio</span>}
    <Controller name={`${fieldName}.direccion`} control={control} render={({ field }) => <Input {...field} placeholder="Dirección (opcional)" />} />
    {showBirthDate && <Controller name={`${fieldName}.fechanacimiento`} control={control} render={({ field }) => <Input {...field} type="date" placeholder="Fecha de nacimiento (opcional)" />} />}
    {showMunicipio && <Controller name={`${fieldName}.municipio`} control={control} render={({ field }) => <Input {...field} placeholder="Municipio (opcional)" />} />}
    <Controller name={`${fieldName}.telefono`} control={control} render={({ field }) => <Input {...field} placeholder="Teléfono" required className={errors?.[fieldName]?.telefono ? 'border-red-500' : ''} />} />
    {errors?.[fieldName]?.telefono && <span className="text-red-500 text-xs">El teléfono es obligatorio</span>}
  </div>
);

export const NewPolicyForm: React.FC<{ onPolicyCreated: (policy: Policy) => void }> = ({ onPolicyCreated }) => {
  const { control, register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<any>({
    defaultValues: {
      contratante: { nombre: '', rfc: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' },
      asegurado: { nombre: '', rfc: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' },
      dueñoFinal: { nombre: '', rfc: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' },
      contactoPago: { nombre: '', rfc: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' },
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
      moduloVigencia: '1',
    }
  });

  // Watch para copiar datos
  const contratanteData = watch('contratante');

  const handleCopyContratante = (checked: boolean, role: 'asegurado' | 'dueñoFinal' | 'contactoPago') => {
    if (checked) {
      setValue(role, contratanteData);
    } else {
      setValue(role, { nombre: '', rfc: '', direccion: '', telefono: '' });
    }
  };

  // Nuevo: Estado para el módulo de vigencia
  const [modulos] = useState([
    { label: '1 año', value: '1' },
    { label: '5 años', value: '5' },
    { label: '10 años', value: '10' },
  ]);
  const fechaPagoActual = watch('fechaPagoActual');
  const moduloVigencia = watch('moduloVigencia');

  useEffect(() => {
    if (fechaPagoActual && moduloVigencia) {
      const inicio = fechaPagoActual;
      const inicioDate = new Date(inicio);
      // Vigencia anual
      const finAnual = new Date(inicioDate);
      finAnual.setFullYear(finAnual.getFullYear() + 1);
      // Vigencia total
      const finTotal = new Date(inicioDate);
      finTotal.setFullYear(finTotal.getFullYear() + parseInt(moduloVigencia));
      // Formato YYYY-MM-DD
      const format = (d: Date) => d.toISOString().slice(0, 10);
      setValue('vigenciaPeriodo.inicio', inicio);
      setValue('vigenciaPeriodo.fin', format(finAnual));
      setValue('vigenciaTotal.inicio', inicio);
      setValue('vigenciaTotal.fin', format(finTotal));
      setValue('terminoPagos', format(finTotal));
    }
  }, [fechaPagoActual, moduloVigencia, setValue]);

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      const policyToSave = {
        ...data,
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

      {/* Contacto para pago */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox id="copy-to-pago" onCheckedChange={(c) => handleCopyContratante(c as boolean, 'contactoPago')} />
          <label htmlFor="copy-to-pago">El contacto de pago es el mismo que el contratante</label>
        </div>
        <ContactFields control={control} fieldName="contactoPago" tooltip="Persona designada para la gestión de pagos y comunicaciones. Especialmente útil para empresas." errors={errors} />
      </div>

      {/* --- DATOS DE LA PÓLIZA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
        <div>
          <Label htmlFor="policyNumber">Número de póliza</Label>
          <Input id="policyNumber" {...register('policyNumber', { required: true })} />
        </div>
        <div>
          <Label htmlFor="ramo">Ramo <Tooltip text="Categoría principal del seguro (Vida, Gastos Médicos, Autos, Daños, etc.)" /></Label>
          <Controller
            name="ramo"
            control={control}
            rules={{ required: true }}
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
          <Input id="aseguradora" {...register('aseguradora', { required: true })} />
        </div>
        <div>
          <Label htmlFor="sumaAsegurada">Suma asegurada</Label>
          <Input id="sumaAsegurada" type="number" step="any" {...register('sumaAsegurada', { required: true })} />
        </div>
        <div>
          <Label htmlFor="formaDePago">Forma de pago</Label>
          <Controller
            name="formaDePago"
            control={control}
            rules={{ required: true }}
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
            rules={{ required: true }}
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
            rules={{ required: true }}
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
          <Input id="premiumAmount" type="number" step="any" {...register('premiumAmount', { required: true })} />
        </div>
      </div>

      {/* Fechas críticas de la póliza */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-gray-50">
        <div>
          <Label htmlFor="fechaPagoActual">Fecha de pago actual</Label>
          <Input id="fechaPagoActual" type="date" {...register('fechaPagoActual', { required: true })} />
        </div>
        <div>
          <Label htmlFor="vigenciaPeriodoInicio">Vigencia anual - Inicio</Label>
          <Input id="vigenciaPeriodoInicio" type="date" {...register('vigenciaPeriodo.inicio', { required: true })} />
        </div>
        <div>
          <Label htmlFor="vigenciaPeriodoFin">Vigencia anual - Fin</Label>
          <Input id="vigenciaPeriodoFin" type="date" {...register('vigenciaPeriodo.fin', { required: true })} />
        </div>
        <div>
          <Label htmlFor="vigenciaTotalInicio">Vigencia total - Inicio</Label>
          <Input id="vigenciaTotalInicio" type="date" {...register('vigenciaTotal.inicio', { required: true })} />
        </div>
        <div>
          <Label htmlFor="vigenciaTotalFin">Vigencia total - Fin</Label>
          <Input id="vigenciaTotalFin" type="date" {...register('vigenciaTotal.fin', { required: true })} />
        </div>
        <div>
          <Label htmlFor="terminoPagos">Fecha de término de pagos</Label>
          <Input id="terminoPagos" type="date" {...register('terminoPagos')} />
        </div>
      </div>

      {/* Módulo de vigencia */}
      <div>
        <Label htmlFor="moduloVigencia">Módulo de vigencia</Label>
        <select id="moduloVigencia" {...register('moduloVigencia')} className="border rounded px-2 py-1">
          {modulos.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Manejo de versiones y subproducto puede ser implementado en pasos siguientes */}

      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Crear Póliza'}</Button>
    </form>
  );
};

export default NewPolicyForm;
