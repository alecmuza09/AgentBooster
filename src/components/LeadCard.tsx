import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '../types/lead';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Mail, Phone, User, Calendar, DollarSign, Pencil, Clock, AlertTriangle, TrendingUp, MapPin, Building } from 'lucide-react';
import { LeadStatusBadge, InactivityAlert } from './LeadBadges.tsx';
import { differenceInDays } from 'date-fns';

interface LeadCardProps {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  isDragging?: boolean;
}

const DaysInStageIndicator = ({ date }: { date?: string }) => {
    if (!date) return null;
    const days = differenceInDays(new Date(), parseISO(date));
    
    let colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    let icon = <Clock className="w-3 h-3" />;
    
    if (days > 7) {
        colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        icon = <AlertTriangle className="w-3 h-3" />;
    }
    if (days > 15) {
        colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        icon = <AlertTriangle className="w-3 h-3" />;
    }

    return (
        <Badge variant="outline" className={`text-xs font-medium px-2 py-1 rounded-full ${colorClass} border-0`}>
            <div className="flex items-center gap-1">
                {icon}
                <span>{days}d</span>
            </div>
        </Badge>
    );
};

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit, isDragging }) => {

  const formatDate = (dateString?: string) => {
    return dateString ? format(parseISO(dateString), 'dd MMM', { locale: es }) : '-';
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('leadId', lead.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card 
      id={`lead-card-${lead.id}`}
      className={clsx(
        'transition-all duration-200 cursor-grab border-0 shadow-md hover:shadow-lg',
        'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm',
        'hover:bg-white dark:hover:bg-slate-800',
        isDragging && 'shadow-2xl scale-105 rotate-2',
        'group'
      )}
    >
      <CardContent className="p-4">
        {/* Header con nombre y acciones */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={lead.name}>
              {lead.name || 'Sin Nombre'}
            </h4>
            {lead.source && (
              <div className="flex items-center gap-1 mt-1">
                <Building className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{lead.source}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {/* Alerta de inactividad si aplica */}
            {(lead.status !== 'Cerrado' && lead.status !== 'Frenado') && 
              <DaysInStageIndicator date={lead.statusUpdatedAt} />
            }
            
            {/* Botón de edición */}
            {onEdit && (
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                title="Editar Lead"
                onClick={() => onEdit(lead)}
              >
                <Pencil className="w-4 h-4 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400" />
              </button>
            )}
          </div>
        </div>

        {/* Badge de estado */}
        <div className="mb-3">
          <LeadStatusBadge status={lead.status} />
        </div>

        {/* Información de contacto */}
        <div className="space-y-2 mb-3">
          {lead.email && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <Mail className="w-3 h-3 text-slate-500 flex-shrink-0" />
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{lead.email}</span>
            </div>
          )}
          
          {lead.phone && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <Phone className="w-3 h-3 text-slate-500 flex-shrink-0" />
              <span className="text-xs text-slate-700 dark:text-slate-300">{lead.phone}</span>
            </div>
          )}
        </div>

        {/* Información financiera */}
        {lead.potentialValue && (
          <div className="mb-3 p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                  ${lead.potentialValue.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">Valor Potencial</p>
              </div>
            </div>
          </div>
        )}

        {/* Fechas importantes */}
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>Creado: {formatDate(lead.createdAt)}</span>
            </div>
          </div>
          
          {lead.lastContactedDate && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Últ. Contacto: {formatDate(lead.lastContactedDate)}</span>
            </div>
          )}
        </div>

        {/* Notas si existen */}
        {lead.notes && (
          <div className="mt-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200 line-clamp-2">
              {lead.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 