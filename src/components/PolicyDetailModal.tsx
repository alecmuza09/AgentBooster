import { Modal } from "@/components/Modal";
import { Policy } from "@/types/policy";
import { Button } from "./ui/button";

interface PolicyDetailModalProps {
  policy: Policy | null;
  onClose: () => void;
}

const DetailRow = ({ label, value }: { label: string, value: any }) => (
    <div className="grid grid-cols-2 gap-2 py-2 border-b">
        <p className="font-semibold text-gray-600 dark:text-gray-300">{label}</p>
        <p className="text-gray-800 dark:text-gray-100">{value || 'N/A'}</p>
    </div>
);

export const PolicyDetailModal = ({ policy, onClose }: PolicyDetailModalProps) => {
  if (!policy) return null;

  return (
    <Modal
      isOpen={!!policy}
      onClose={onClose}
      title={`Detalles de Póliza: ${policy.policyNumber}`}
      size="2xl"
    >
        <div className="max-h-[70vh] overflow-y-auto pr-4">
            <DetailRow label="Número de Póliza" value={policy.policyNumber} />
            <DetailRow label="Inciso" value={policy.inciso} />
            <DetailRow label="Concepto" value={policy.concepto} />
            <DetailRow label="Modelo" value={policy.modelo} />
            <DetailRow label="No. Serie" value={policy.numeroSerie} />
            <DetailRow label="Cliente ID" value={policy.clienteId} />
            <DetailRow label="Clave de Agente" value={policy.claveAgente} />
            <DetailRow label="Asegurado" value={policy.asegurado.nombre} />
            <DetailRow label="Aseguradora" value={policy.aseguradora} />
            <DetailRow label="Ramo" value={policy.ramo} />
            <DetailRow label="Estado" value={policy.status} />
            <DetailRow label="Prima Neta" value={policy.primaNeta != null ? `${policy.primaNeta} ${policy.moneda}` : 'N/A'} />
            <DetailRow label="Derecho" value={policy.derecho != null ? `${policy.derecho} ${policy.moneda}` : 'N/A'} />
            <DetailRow label="Recargo" value={policy.recargo != null ? `${policy.recargo} ${policy.moneda}` : 'N/A'} />
            <DetailRow label="Total" value={policy.total != null ? `${policy.total} ${policy.moneda}` : 'N/A'} />
            <DetailRow label="Forma de Pago" value={policy.formaDePago} />
            <DetailRow label="Conducto de Pago" value={policy.conductoDePago} />
            <DetailRow label="Tipo de Cargo" value={policy.tipoDeCargo} />
            <DetailRow label="Fecha de Registro" value={policy.fechaRegistro} />
            <DetailRow label="Vigencia del Recibo" value={`${policy.vigenciaPeriodo.inicio} - ${policy.vigenciaPeriodo.fin}`} />
            <DetailRow label="Vigencia Total de Póliza" value={`${policy.vigenciaTotal.inicio} - ${policy.vigenciaTotal.fin}`} />
        </div>
        <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
    </Modal>
  );
};
