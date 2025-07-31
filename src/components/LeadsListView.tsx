import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronUp, ChevronDown, MoreHorizontal, Pencil, Phone, Mail } from 'lucide-react';
import { Lead, LeadStatus, LeadSortField, SortDirection } from '@/types/lead';
import { LeadStatusBadge } from './LeadBadges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface LeadsListViewProps {
  leads: Lead[];
  onLeadStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onEditLead?: (lead: Lead) => void;
}

const leadStatusConfig = {
  'Nuevo': { label: 'Nuevo', color: 'bg-blue-100 text-blue-800' },
  'Contactado': { label: 'Contactado', color: 'bg-yellow-100 text-yellow-800' },
  'Cita': { label: 'Cita', color: 'bg-purple-100 text-purple-800' },
  'Propuesta': { label: 'Propuesta', color: 'bg-orange-100 text-orange-800' },
  'Cerrado': { label: 'Cerrado', color: 'bg-green-100 text-green-800' },
  'Frenado': { label: 'Frenado', color: 'bg-red-100 text-red-800' }
};

const DaysInStageIndicator: React.FC<{ date?: string }> = ({ date }) => {
  if (!date) return null;

  const daysInStage = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  
  let color = 'text-green-600';
  if (daysInStage > 14) color = 'text-red-600';
  else if (daysInStage > 7) color = 'text-yellow-600';

  return (
    <span className={`text-xs font-medium ${color}`}>
      {daysInStage} días
    </span>
  );
};

export const LeadsListView: React.FC<LeadsListViewProps> = ({ 
  leads, 
  onLeadStatusChange, 
  onEditLead 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sortField, setSortField] = useState<LeadSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = 
        (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        lead.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Manejar fechas
      if (sortField === 'createdAt' || sortField === 'lastContactedDate') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Manejar strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [leads, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: LeadSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon: React.FC<{ field: LeadSortField }> = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(leadStatusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      Nombre
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      Estado
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días en etapa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('lastContactedDate')}>
                    <div className="flex items-center gap-1">
                      Último contacto
                      <SortIcon field="lastContactedDate" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center gap-1">
                      Creado
                      <SortIcon field="createdAt" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.name || 'Sin Nombre'}
                        </div>
                        {lead.source && (
                          <div className="text-sm text-gray-500">
                            Fuente: {lead.source}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{lead.phone}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{lead.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <DaysInStageIndicator date={lead.statusUpdatedAt} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.lastContactedDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEditLead && (
                            <DropdownMenuItem onClick={() => onEditLead(lead)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {Object.entries(leadStatusConfig).map(([status, config]) => (
                            <DropdownMenuItem 
                              key={status}
                              onClick={() => onLeadStatusChange(lead.id, status as LeadStatus)}
                              disabled={lead.status === status}
                            >
                              Cambiar a {config.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedLeads.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron leads con los filtros aplicados'
                : 'No hay leads registrados'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="text-sm text-gray-500">
        Mostrando {filteredAndSortedLeads.length} de {leads.length} leads
      </div>
    </div>
  );
}; 