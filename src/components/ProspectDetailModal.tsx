import React from 'react';
import { Modal } from './Modal'; // Importar componente Modal base
import { Prospect } from '../pages/ProspectsKanban'; // Importar tipo Prospect
import { X, User, Building, Mail, Phone, DollarSign, Info, Calendar } from 'lucide-react';
import clsx from 'clsx';

interface ProspectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: Prospect | null; // Prospecto a mostrar
}

export const ProspectDetailModal: React.FC<ProspectDetailModalProps> = ({ isOpen, onClose, prospect }) => {
  if (!prospect) return null; // No renderizar si no hay prospecto

  // Helper para mostrar info con icono
  const DetailItem: React.FC<{ icon: React.ElementType; label: string; value?: string | number | null }> = 
    ({ icon: Icon, label, value }) => (
      value ? (
        <div className="flex items-start mb-2">
          <Icon className="w-4 h-4 mr-2 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div>
             <span className="text-xs text-gray-500 dark:text-gray-400 block">{label}</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{value}</span>
          </div>
        </div>
      ) : null
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Prospecto: ${prospect.name}`}>
       <div className="space-y-4">
            {/* Información Principal */} 
            <DetailItem icon={User} label="Nombre Completo" value={prospect.name} />
            <DetailItem icon={Building} label="Empresa" value={prospect.company} />
            <DetailItem icon={Mail} label="Correo Electrónico" value={prospect.email} />
            <DetailItem icon={Phone} label="Teléfono" value={prospect.phone} />

            {/* Información Adicional */} 
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <DetailItem icon={DollarSign} label="Valor Potencial" value={prospect.value ? `$${prospect.value.toLocaleString()}` : 'No especificado'} />
                 <DetailItem icon={Info} label="Origen" value={prospect.source} />
                <DetailItem icon={Calendar} label="Última Interacción" value={prospect.lastInteraction} />
            </div>

            {/* TODO: Podrían ir botones de acción como "Editar Prospecto", "Añadir Nota", etc. */}

       </div>
        {/* Botón Cerrar (generalmente está en el componente Modal base, pero por si acaso) */} 
        {/* <div className="mt-5 sm:mt-6">
            <button
                type="button"
                 className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                 onClick={onClose}
             >
                Cerrar
             </button>
         </div> */}
     </Modal>
  );
}; 