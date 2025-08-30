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
import { PolicyDocumentUploader, DocumentToUpload } from './PolicyDocumentUploader';

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
  // Estado para documentos
  const [documents, setDocuments] = useState<DocumentToUpload[]>([]);
  
  const { control, register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<any>({
    defaultValues: {
      contratante: { nombre: '', rfc: '', correo: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' },
      asegurado: { nombre: '', rfc: '', correo: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' },
      dueñoFinal: { nombre: '', rfc: '', correo: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' },
      contactosPago: [
        { nombre: '', rfc: '', correo: '', direccion: '', telefono: '', fechanacimiento: '', municipio: '' }
      ],
      policyNumber: '',
      inciso: undefined,
      concepto: '',
      modelo: '',
      numeroSerie: '',
      clienteId: '',
      claveAgente: '',
      ramo: '',
      subproducto: '',
      aseguradora: '',
      sumaAsegurada: 0,
      formaDePago: '',
      conductoDePago: '',
      moneda: '',
      primaNeta: 0,
      derecho: 0,
      recargo: 0,
      total: 0,
      tipoDeCargo: '',
      // 5 fechas clave
      fechaSolicitud: '',
      fechaVigenciaInicial: '',
      fechaVigenciaFinal: '',
      fechaEmision: '',
      fechaPrimerPago: '',
      // Fechas adicionales
      fechaRegistro: '',
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

      // Sincronizar fechas de vigencia con vigenciaTotal para compatibilidad
      const vigenciaTotal = {
        inicio: data.fechaVigenciaInicial || data.vigenciaTotal?.inicio || '',
        fin: data.fechaVigenciaFinal || data.vigenciaTotal?.fin || ''
      };

      // Si no se especificó fechaSolicitud, usar la fecha actual
      const fechaSolicitud = data.fechaSolicitud || new Date().toISOString().split('T')[0];

      const policyToSave = {
        ...data,
        contactosPago: contactosPagoFiltrados,
        status: 'active', // Por defecto
        // Asegurar que las fechas clave estén presentes
        fechaSolicitud,
        fechaVigenciaInicial: data.fechaVigenciaInicial,
        fechaVigenciaFinal: data.fechaVigenciaFinal,
        fechaEmision: data.fechaEmision,
        fechaPrimerPago: data.fechaPrimerPago,
        // Mantener compatibilidad con campos existentes
        vigenciaTotal
      };
      
      console.log('Policy data being saved:', policyToSave);
      console.log('Documents to attach:', documents);
      
      // TODO: Aquí se procesarían los documentos adjuntos
      // Por ahora solo los registramos en el log
      if (documents.length > 0) {
        console.log(`Se adjuntarán ${documents.length} documentos a la póliza:`, 
          documents.map(doc => ({ title: doc.title, category: doc.category, fileName: doc.file.name }))
        );
      }
      
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
          <Label htmlFor="inciso">Inciso</Label>
          <Input id="inciso" type="number" {...register('inciso')} />
        </div>
        <div>
          <Label htmlFor="concepto">Concepto</Label>
          <Input id="concepto" {...register('concepto')} />
        </div>
        <div>
          <Label htmlFor="modelo">Modelo</Label>
          <Input id="modelo" {...register('modelo')} />
        </div>
        <div>
          <Label htmlFor="numeroSerie">No. Serie</Label>
          <Input id="numeroSerie" {...register('numeroSerie')} />
        </div>
        <div>
          <Label htmlFor="clienteId">Cliente ID</Label>
          <Input id="clienteId" {...register('clienteId')} />
        </div>
        <div>
          <Label htmlFor="claveAgente">Clave de Agente</Label>
          <Input id="claveAgente" {...register('claveAgente')} />
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
          <Label htmlFor="primaNeta">Prima Neta</Label>
          <Input id="primaNeta" type="number" step="any" {...register('primaNeta')} />
        </div>
        <div>
          <Label htmlFor="derecho">Derecho</Label>
          <Input id="derecho" type="number" step="any" {...register('derecho')} />
        </div>
        <div>
          <Label htmlFor="recargo">Recargo</Label>
          <Input id="recargo" type="number" step="any" {...register('recargo')} />
        </div>
        <div>
          <Label htmlFor="total">Total</Label>
          <Input id="total" type="number" step="any" {...register('total')} />
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
          <Label htmlFor="tipoDeCargo">Tipo de Cargo</Label>
          <Controller
            name="tipoDeCargo"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Selecciona el tipo de cargo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAT">CAT</SelectItem>
                  <SelectItem value="CXC">CXC</SelectItem>
                  <SelectItem value="CUT">CUT</SelectItem>
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
                </SelectContent>
              </Select>
            )}
          />
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

      {/* 5 FECHAS CLAVE DE LA PÓLIZA */}
      <div className="border p-4 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">📅 Fechas Clave de la Póliza</h3>
          <Tooltip text="Las 5 fechas fundamentales para la gestión correcta de la póliza" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Fecha de Solicitud/Creación */}
          <div className="space-y-2">
            <Label htmlFor="fechaSolicitud" className="flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">1</span>
              Fecha de Solicitud
            </Label>
            <Input 
              id="fechaSolicitud" 
              type="date" 
              {...register('fechaSolicitud')}
              className="border-blue-200 dark:border-blue-700 focus:border-blue-400 dark:focus:border-blue-500"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">Cuando se inició el proceso</p>
          </div>

          {/* 2. Fecha de Vigencia Inicial */}
          <div className="space-y-2">
            <Label htmlFor="fechaVigenciaInicial" className="flex items-center gap-2">
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">2</span>
              Vigencia Inicial *
            </Label>
            <Input 
              id="fechaVigenciaInicial" 
              type="date" 
              {...register('fechaVigenciaInicial', { required: 'La fecha de vigencia inicial es obligatoria' })}
              className="border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">Inicio de la cobertura</p>
            {errors.fechaVigenciaInicial && <span className="text-red-500 text-xs">{errors.fechaVigenciaInicial.message}</span>}
          </div>

          {/* 3. Fecha de Vigencia Final */}
          <div className="space-y-2">
            <Label htmlFor="fechaVigenciaFinal" className="flex items-center gap-2">
              <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs font-medium">3</span>
              Vigencia Final *
            </Label>
            <Input 
              id="fechaVigenciaFinal" 
              type="date" 
              {...register('fechaVigenciaFinal', { required: 'La fecha de vigencia final es obligatoria' })}
              className="border-orange-200 dark:border-orange-700 focus:border-orange-400 dark:focus:border-orange-500"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">Fin de la cobertura</p>
            {errors.fechaVigenciaFinal && <span className="text-red-500 text-xs">{errors.fechaVigenciaFinal.message}</span>}
          </div>

          {/* 4. Fecha de Emisión */}
          <div className="space-y-2">
            <Label htmlFor="fechaEmision" className="flex items-center gap-2">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">4</span>
              Fecha de Emisión
            </Label>
            <Input 
              id="fechaEmision" 
              type="date" 
              {...register('fechaEmision')}
              className="border-purple-200 dark:border-purple-700 focus:border-purple-400 dark:focus:border-purple-500"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">Emisión formal de la póliza</p>
          </div>

          {/* 5. Fecha de Primer Pago */}
          <div className="space-y-2">
            <Label htmlFor="fechaPrimerPago" className="flex items-center gap-2">
              <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full text-xs font-medium">5</span>
              Primer Pago/Programado
            </Label>
            <Input 
              id="fechaPrimerPago" 
              type="date" 
              {...register('fechaPrimerPago')}
              className="border-indigo-200 dark:border-indigo-700 focus:border-indigo-400 dark:focus:border-indigo-500"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">Primera prima o pago programado</p>
          </div>
        </div>
      </div>

      {/* Fechas Adicionales de Gestión */}
      <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">📋 Fechas Adicionales de Gestión</h3>
          <Tooltip text="Fechas complementarias para el control y seguimiento de la póliza" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="vigenciaPeriodoInicio">Vigencia del Recibo - Inicio</Label>
          <Input id="vigenciaPeriodoInicio" type="date" {...register('vigenciaPeriodo.inicio')} />
            <p className="text-xs text-gray-500 dark:text-gray-400">Período del recibo actual</p>
        </div>
        <div>
          <Label htmlFor="vigenciaPeriodoFin">Vigencia del Recibo - Fin</Label>
          <Input id="vigenciaPeriodoFin" type="date" {...register('vigenciaPeriodo.fin')} />
            <p className="text-xs text-gray-500 dark:text-gray-400">Fin del período del recibo</p>
        </div>
        <div>
          <Label htmlFor="fechaRegistro">Fecha de Registro</Label>
          <Input id="fechaRegistro" type="date" {...register('fechaRegistro')} />
            <p className="text-xs text-gray-500 dark:text-gray-400">Registro en el sistema</p>
        </div>
        <div>
            <Label htmlFor="terminoPagos">Término de Pagos</Label>
          <Input id="terminoPagos" type="date" {...register('terminoPagos')} />
            <p className="text-xs text-gray-500 dark:text-gray-400">Fecha límite de pagos</p>
        </div>
        <div>
            <Label htmlFor="fechaPagoActual">Próximo Pago</Label>
          <Input id="fechaPagoActual" type="date" {...register('fechaPagoActual')} />
            <p className="text-xs text-gray-500 dark:text-gray-400">Fecha del próximo pago</p>
          </div>
        </div>
      </div>

      {/* Documentos de la Póliza */}
      <PolicyDocumentUploader
        documents={documents}
        onDocumentsChange={setDocuments}
        className="border p-4 rounded-md bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
      />

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
