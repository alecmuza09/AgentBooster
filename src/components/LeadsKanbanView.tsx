import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Lead, LeadStatus } from '../types/lead';
import { LeadCard } from './LeadCard';
import { leadStatusConfig } from './LeadBadges';

interface LeadsKanbanViewProps {
  leads: Lead[];
  onLeadStatusChange: (leadId: string, newStatus: string) => void;
  onEditLead?: (lead: Lead) => void;
}

const columnOrder: LeadStatus[] = ['Nuevo', 'Contactado', 'Cita', 'Propuesta', 'Cerrado', 'Frenado'];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-5">
        {columnOrder.map(status => (
          <Droppable droppableId={status} key={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-blue-100 dark:bg-blue-900/50' : ''
                }`}
              >
                <h3 className="font-semibold text-lg mb-4 px-1 flex items-center justify-between">
                  <span>{leadStatusConfig[status]?.label || status}</span>
                  <span className="text-sm font-normal text-gray-500 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
                    {leadsByStatus[status].length}
                  </span>
                </h3>
                <div className="space-y-3 min-h-[300px]">
                  {leadsByStatus[status].map((lead, index) => (
                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <LeadCard lead={lead} isDragging={snapshot.isDragging} onEdit={onEditLead} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}; 