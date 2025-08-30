import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead, LeadStatus } from '../types/lead';
import { LeadCard } from './LeadCard';
import { leadStatusConfig } from './LeadBadges';
import { Users, Target, Phone, Calendar, FileText, CheckCircle, Pause, TrendingUp, Clock, AlertCircle } from 'lucide-react';

interface LeadsKanbanViewProps {
  leads: Lead[];
  onLeadStatusChange: (leadId: string, newStatus: string) => void;
  onEditLead?: (lead: Lead) => void;
}

const columnOrder: LeadStatus[] = ['Nuevo', 'Contactado', 'Cita', 'Propuesta', 'Cerrado', 'Frenado'];

// Configuración de colores y iconos para cada columna
const columnConfig = {
  'Nuevo': {
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: Target,
    gradient: 'from-blue-500 to-blue-600'
  },
  'Contactado': {
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: Phone,
    gradient: 'from-purple-500 to-purple-600'
  },
  'Cita': {
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    icon: Calendar,
    gradient: 'from-orange-500 to-orange-600'
  },
  'Propuesta': {
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    icon: FileText,
    gradient: 'from-indigo-500 to-indigo-600'
  },
  'Cerrado': {
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: CheckCircle,
    gradient: 'from-green-500 to-green-600'
  },
  'Frenado': {
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: Pause,
    gradient: 'from-red-500 to-red-600'
  }
};

export const LeadsKanbanView: React.FC<LeadsKanbanViewProps> = ({ leads, onLeadStatusChange, onEditLead }) => {
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId)) {
      return;
    }
    onLeadStatusChange(draggableId, destination.droppableId);
  };

  const leadsByStatus = columnOrder.reduce((acc, status) => {
    acc[status] = leads.filter(l => l.status === status);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {columnOrder.map(status => {
          const config = columnConfig[status];
          const Icon = config.icon;
          const leadsInColumn = leadsByStatus[status];
          
          return (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`transition-all duration-300 ${
                    snapshot.isDraggingOver ? 'scale-105' : ''
                  }`}
                >
                  <Card className={`border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden ${
                    snapshot.isDraggingOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}>
                    <CardHeader className={`bg-gradient-to-r ${config.gradient} text-white p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg font-semibold">
                              {leadStatusConfig[status]?.label || status}
                            </CardTitle>
                            <p className="text-white/80 text-sm">
                              {leadsInColumn.length} lead{leadsInColumn.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0 font-bold">
                          {leadsInColumn.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4">
                      <div className="space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
                        {leadsInColumn.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-32 text-slate-400 dark:text-slate-500">
                            <Users className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm text-center">No hay leads en esta etapa</p>
                          </div>
                        ) : (
                          leadsInColumn.map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`transition-all duration-200 ${
                                    snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl' : 'hover:scale-[1.02]'
                                  }`}
                                >
                                  <LeadCard 
                                    lead={lead} 
                                    isDragging={snapshot.isDragging} 
                                    onEdit={onEditLead} 
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}; 