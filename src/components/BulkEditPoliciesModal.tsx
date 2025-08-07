import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Policy, PolicyStatus, FormaDePago, ConductoDePago } from '@/types/policy';

type BulkUpdates = Partial<Pick<Policy, 'status' | 'formaDePago' | 'conductoDePago' | 'aseguradora'>>;

interface BulkEditPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (updates: BulkUpdates) => Promise<void> | void;
  title?: string;
}

export const BulkEditPoliciesModal: React.FC<BulkEditPoliciesModalProps> = ({ isOpen, onClose, onApply, title }) => {
  const [status, setStatus] = useState<PolicyStatus | ''>('');
  const [formaDePago, setFormaDePago] = useState<FormaDePago | ''>('');
  const [conductoDePago, setConductoDePago] = useState<ConductoDePago | ''>('');
  const [aseguradora, setAseguradora] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = async () => {
    const updates: BulkUpdates = {};
    if (status) updates.status = status;
    if (formaDePago) updates.formaDePago = formaDePago;
    if (conductoDePago) updates.conductoDePago = conductoDePago;
    if (aseguradora.trim()) updates.aseguradora = aseguradora.trim();

    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      await onApply(updates);
      onClose();
      // Reset
      setStatus('');
      setFormaDePago('');
      setConductoDePago('');
      setAseguradora('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Edición masiva de pólizas'}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Estado</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PolicyStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Sin cambio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="expired">Vencida</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="pending_renewal">Pendiente de renovación</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Forma de pago</Label>
            <Select value={formaDePago} onValueChange={(v) => setFormaDePago(v as FormaDePago)}>
              <SelectTrigger>
                <SelectValue placeholder="Sin cambio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Anual">Anual</SelectItem>
                <SelectItem value="Semestral">Semestral</SelectItem>
                <SelectItem value="Trimestral">Trimestral</SelectItem>
                <SelectItem value="Mensual">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Conducto de pago</Label>
            <Select value={conductoDePago} onValueChange={(v) => setConductoDePago(v as ConductoDePago)}>
              <SelectTrigger>
                <SelectValue placeholder="Sin cambio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Agente">Agente</SelectItem>
                <SelectItem value="Domiciliado">Domiciliado</SelectItem>
                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Aseguradora</Label>
            <Input placeholder="Sin cambio" value={aseguradora} onChange={(e) => setAseguradora(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleApply} disabled={isSubmitting}>{isSubmitting ? 'Aplicando...' : 'Aplicar cambios'}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkEditPoliciesModal;

