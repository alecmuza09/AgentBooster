import React from 'react';
import clsx from 'clsx';
import { format, parseISO, differenceInDays } from 'date-fns';
import {
    Clock, Phone, Mail, CalendarClock, Handshake, CircleSlash, AlertCircle, Sparkles, Star, Users, Award, XCircle 
} from 'lucide-react';
import { LeadStatus } from '../types/lead';

// Mapeo de estados a etiquetas y colores/iconos
export const leadStatusConfig: Record<LeadStatus, { label: string; icon: React.ElementType; colorClasses: string }> = {
  'Nuevo': { label: 'Nuevo', icon: Sparkles, colorClasses: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' },
  'Contactado': { label: 'Contactado', icon: Phone, colorClasses: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' },
  'Cita': { label: 'Cita', icon: CalendarClock, colorClasses: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' },
  'Propuesta': { label: 'Propuesta', icon: Mail, colorClasses: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400' },
  'Cerrado': { label: 'Cerrado', icon: Handshake, colorClasses: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' },
  'Frenado': { label: 'Frenado', icon: CircleSlash, colorClasses: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' },
};

// Componente para el badge de estado (exportado)
export const LeadStatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
  const config = leadStatusConfig[status] || leadStatusConfig['Nuevo'];
  const Icon = config.icon;
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
      config.colorClasses
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Componente para la alerta de inactividad (exportado)
export const InactivityAlert: React.FC<{ lastContactDate?: string }> = ({ lastContactDate }) => {
  if (!lastContactDate) {
    return null;
  }
  let daysSinceContact = 0;
  try {
      daysSinceContact = differenceInDays(new Date(), parseISO(lastContactDate));
  } catch (error) {
      console.error("Error parsing lastContactDate:", lastContactDate, error);
      return null; // No mostrar alerta si la fecha es inválida
  }

  let alertLevel: 'none' | 'warning' | 'danger' = 'none';
  if (daysSinceContact > 14) {
    alertLevel = 'danger';
  } else if (daysSinceContact > 7) {
    alertLevel = 'warning';
  }

  if (alertLevel === 'none') {
    return null;
  }

  const iconColor = alertLevel === 'danger' ? 'text-red-500 dark:text-red-400' : 'text-orange-500 dark:text-orange-400';
  const tooltipText = `${alertLevel === 'danger' ? 'REQUIERE ACCIÓN: ' : ''}Último contacto hace ${daysSinceContact} días`;

  return (
    <div className="flex items-center gap-1" title={tooltipText}>
      <AlertCircle className={clsx("w-4 h-4", iconColor)} />
      <span className={clsx("text-xs font-medium", iconColor)}>
        {daysSinceContact}d
      </span>
    </div>
  );
}; 