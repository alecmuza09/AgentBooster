import React from 'react';
import { Lead } from '../types/lead';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Mail, Phone, User, Calendar, DollarSign, Pencil } from 'lucide-react';
import { LeadStatusBadge, InactivityAlert } from './LeadBadges.tsx';
import { differenceInDays } from 'date-fns';

interface LeadCardProps {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
}

const DaysInStageIndicator = ({ date }: { date?: string }) => {
    if (!date) return null;
    const days = differenceInDays(new Date(), parseISO(date));
    
    let colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (days > 7) colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    if (days > 15) colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';

    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
            {days}d
        </span>
    );
};

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit }) => {

  const formatDate = (dateString?: string) => {
    return dateString ? format(parseISO(dateString), 'dd MMM', { locale: es }) : '-';
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('leadId', lead.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      id={`lead-card-${lead.id}`}
      className={clsx(
        'p-3 mb-3 rounded-lg shadow-sm border transition-colors cursor-grab',
        'bg-white hover:bg-gray-50 border-gray-200',
        'dark:bg-gray-800 dark:hover:bg-gray-700/50 dark:border-gray-700'
      )}
    >
      {/* Nombre y Estado + Botón de edición */}
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate" title={lead.name}>
          {lead.name || 'Sin Nombre'}
        </h4>
        <div className="flex items-center gap-2">
          {/* Alerta de inactividad si aplica */}
          {(lead.status !== 'Cerrado' && lead.status !== 'Frenado') && 
            <DaysInStageIndicator date={lead.statusUpdatedAt} />
          }
          {/* Botón de edición */}
          {onEdit && (
            <button
              type="button"
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Editar Lead"
              onClick={() => onEdit(lead)}
            >
              <Pencil className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Badge de estado */}
      <div className="mb-3">
        <LeadStatusBadge status={lead.status} />
      </div>

      {/* Información clave */}
      <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
        {lead.assignedAdvisor && (
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3 flex-shrink-0" />
            <span>{lead.assignedAdvisor}</span>
          </div>
        )}
        {(lead.email || lead.phone) && (
          <div className="flex items-center gap-1.5">
             {lead.email ? <Mail className="w-3 h-3 flex-shrink-0" /> : <Phone className="w-3 h-3 flex-shrink-0" />}
             <span className="truncate">{lead.email || lead.phone}</span>
          </div>
        )}
         {lead.potentialValue && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3 h-3 flex-shrink-0" />
            <span>Valor: ${lead.potentialValue.toLocaleString()}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 pt-1">
           <Calendar className="w-3 h-3 flex-shrink-0" />
           <span>Creado: {formatDate(lead.createdAt)}</span>
           {lead.lastContactedDate && <span className="ml-auto">Últ. Cont: {formatDate(lead.lastContactedDate)}</span>}
        </div>
      </div>
    </div>
  );
}; 