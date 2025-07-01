import React, { useState, useMemo } from 'react';
import { Seguro, SEGURO_TYPES } from '@/types/finanzas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, Trash2 } from 'lucide-react';

const SegurosPanel: React.FC = () => {
  const [seguros, setSeguros] = useState<Seguro[]>([]);

  const handleAddSeguro = (tipo: typeof SEGURO_TYPES[number]) => {
    const count = seguros.filter(s => s.tipo === tipo).length + 1;
    const newSeguro: Seguro = {
      id: uuidv4(),
      tipo: tipo,
      nombre: `${tipo} ${count}`,
      proteccionFallecimiento: 0,
      proteccionInvalidez: 0,
      valorEfectivoFinal: 0,
      fechaTermino: '',
    };
    setSeguros([...seguros, newSeguro]);
  };

  const handleSeguroChange = (id: string, field: keyof Seguro, value: any) => {
    setSeguros(
      seguros.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleRemoveSeguro = (id: string) => {
    setSeguros(seguros.filter(s => s.id !== id));
  };
  
  const totales = useMemo(() => {
    return {
      fallecimiento: seguros.reduce((acc, s) => acc + s.proteccionFallecimiento, 0),
      invalidez: seguros.reduce((acc, s) => acc + s.proteccionInvalidez, 0),
      efectivo: seguros.reduce((acc, s) => acc + s.valorEfectivoFinal, 0),
    }
  }, [seguros]);

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">6. Gestión de Seguros</h2>
      
      <div className="flex gap-4 mb-4">
        {SEGURO_TYPES.map(tipo => (
          <Button key={tipo} onClick={() => handleAddSeguro(tipo)} className="bg-cyan-600 hover:bg-cyan-700">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir {tipo}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Tipo de Seguro</TableHead>
              <TableHead>Protección por Fallecimiento</TableHead>
              <TableHead>Protección por Invalidez</TableHead>
              <TableHead>Valor Efectivo Final</TableHead>
              <TableHead>Fecha Término</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seguros.map((seguro) => (
              <TableRow key={seguro.id}>
                <TableCell className="font-medium">
                  <Input 
                    type="text" 
                    value={seguro.nombre}
                    onChange={(e) => handleSeguroChange(seguro.id, 'nombre', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input type="number" value={seguro.proteccionFallecimiento} onChange={e => handleSeguroChange(seguro.id, 'proteccionFallecimiento', parseFloat(e.target.value) || 0)} />
                </TableCell>
                <TableCell>
                  <Input type="number" value={seguro.proteccionInvalidez} onChange={e => handleSeguroChange(seguro.id, 'proteccionInvalidez', parseFloat(e.target.value) || 0)} />
                </TableCell>
                <TableCell>
                  <Input type="number" value={seguro.valorEfectivoFinal} onChange={e => handleSeguroChange(seguro.id, 'valorEfectivoFinal', parseFloat(e.target.value) || 0)} />
                </TableCell>
                <TableCell>
                  <Input type="text" value={seguro.fechaTermino} onChange={e => handleSeguroChange(seguro.id, 'fechaTermino', e.target.value)} placeholder="Ej: 2045 o Full Life" />
                </TableCell>
                <TableCell>
                  <Button variant="destructive" size="icon" onClick={() => handleRemoveSeguro(seguro.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-gray-800">
              <TableCell className="font-bold text-right">Totales:</TableCell>
              <TableCell className="font-bold text-cyan-400">${totales.fallecimiento.toLocaleString()}</TableCell>
              <TableCell className="font-bold text-cyan-400">${totales.invalidez.toLocaleString()}</TableCell>
              <TableCell className="font-bold text-cyan-400">${totales.efectivo.toLocaleString()}</TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

       <div className="mt-8 p-4 rounded-lg bg-gray-800">
        <h3 className="text-xl font-bold mb-4 text-cyan-300">Niveles de Protección Sugeridos</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-semibold text-cyan-400">Protección Mínima:</span> 5 años de gastos cubiertos.</p>
          <p><span className="font-semibold text-cyan-400">Protección Suficiente:</span> 10 años de gastos + universidades de los hijos.</p>
          <p><span className="font-semibold text-cyan-400">Protección Ideal:</span> Hijos se independizan + universidad + % para el retiro.</p>
        </div>
      </div>
    </div>
  );
};

export default SegurosPanel; 