import React, { useState } from 'react';
import { Inversion, INVERSION_CATEGORIES } from '@/types/finanzas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { v4 as uuidv4 } from 'uuid';

const InversionesPanel: React.FC = () => {
  const [inversiones, setInversiones] = useState<Inversion[]>([]);

  const handleAddInversion = () => {
    const newInversion: Inversion = {
      id: uuidv4(),
      categoria: 'Acciones Publicas',
      descripcion: '',
      precioEntrada: 0,
      precioMercadoActual: 0,
      moneda: 'MXN',
    };
    setInversiones([...inversiones, newInversion]);
  };

  const handleInversionChange = (id: string, field: keyof Inversion, value: any) => {
    setInversiones(
      inversiones.map((inv) => (inv.id === id ? { ...inv, [field]: value } : inv))
    );
  };
  
  const handleRemoveInversion = (id: string) => {
    setInversiones(inversiones.filter(inv => inv.id !== id));
  };

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4 text-green-400">5. Inversiones</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Precio de Entrada/Adquisición</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead>Precio Mercado Actual</TableHead>
              <TableHead>Plusvalía/Minusvalía</TableHead>
              <TableHead>% de Salida Mínima</TableHead>
              <TableHead>Tasa Crecimiento Promedio Mensualizado</TableHead>
              <TableHead>Tasa Anualizada</TableHead>
              <TableHead>Pago Anual de la Inversión</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inversiones.map((inversion) => {
               const plusvalia = inversion.precioMercadoActual - inversion.precioEntrada;
               const plusvaliaStyle = plusvalia >= 0 ? 'text-green-400' : 'text-red-400';

              return (
                <TableRow key={inversion.id}>
                  <TableCell>
                    <Select
                      value={inversion.categoria}
                      onValueChange={(value) => handleInversionChange(inversion.id, 'categoria', value)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INVERSION_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input type="text" value={inversion.descripcion} onChange={e => handleInversionChange(inversion.id, 'descripcion', e.target.value)} /></TableCell>
                  <TableCell><Input type="number" value={inversion.precioEntrada} onChange={e => handleInversionChange(inversion.id, 'precioEntrada', parseFloat(e.target.value) || 0)} /></TableCell>
                  <TableCell>
                     <Select
                      value={inversion.moneda}
                      onValueChange={(value) => handleInversionChange(inversion.id, 'moneda', value)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MXN">MXN</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input type="number" value={inversion.precioMercadoActual} onChange={e => handleInversionChange(inversion.id, 'precioMercadoActual', parseFloat(e.target.value) || 0)} /></TableCell>
                  <TableCell className={plusvaliaStyle}>{plusvalia.toFixed(2)}</TableCell>
                  <TableCell><Input type="number" value={inversion.salidaMinima || ''} onChange={e => handleInversionChange(inversion.id, 'salidaMinima', parseFloat(e.target.value) || undefined)} placeholder="%" /></TableCell>
                  <TableCell><Input type="number" value={inversion.tasaCrecimientoPromedioMensualizado || ''} onChange={e => handleInversionChange(inversion.id, 'tasaCrecimientoPromedioMensualizado', parseFloat(e.target.value) || undefined)} placeholder="%"/></TableCell>
                  <TableCell><Input type="number" value={inversion.tasaAnualizada || ''} onChange={e => handleInversionChange(inversion.id, 'tasaAnualizada', parseFloat(e.target.value) || undefined)} placeholder="%"/></TableCell>
                  <TableCell><Input type="number" value={inversion.pagoAnualInversion || ''} onChange={e => handleInversionChange(inversion.id, 'pagoAnualInversion', parseFloat(e.target.value) || undefined)} /></TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveInversion(inversion.id)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <Button onClick={handleAddInversion} className="mt-4 bg-green-500 hover:bg-green-600">
        Añadir Inversión
      </Button>
    </div>
  );
};

export default InversionesPanel; 