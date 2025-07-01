import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, List, LayoutGrid, Search, UsersRound, ChevronUp, ChevronDown, Eye, Edit } from 'lucide-react';
import { Lead, LeadStatus, LeadSortField, SortDirection } from '../types/lead';
import { NewLeadForm } from '../components/NewLeadForm';
import { Modal } from '../components/Modal';
import { LeadsKanbanView } from '../components/LeadsKanbanView';
import { LeadStatusBadge, InactivityAlert, leadStatusConfig } from '../components/LeadBadges';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

export default function Leads() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Filtro y ordenamiento
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
    const [sortField, setSortField] = useState<LeadSortField>('created_at');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    useEffect(() => {
        const fetchLeads = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/prospects');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setLeads(data as Lead[]);
            } catch (error) {
                console.error('Error fetching leads:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    const handleLeadCreated = (newLead: Lead) => {
        setLeads(prev => [newLead, ...prev]);
    };

    const handleLeadStatusChange = async (leadId: string, newStatus: LeadStatus) => {
        const originalLeads = [...leads];
        
        let updatedLeads;
        if (newStatus === 'Convertido') {
            updatedLeads = leads.filter(l => l.id !== leadId);
        } else {
            updatedLeads = leads.map(l => 
                l.id === leadId 
                ? { ...l, status: newStatus, last_contact_date: new Date().toISOString() } 
                : l
            );
        }
        setLeads(updatedLeads);

        try {
            const response = await fetch(`/api/prospects/${leadId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                setLeads(originalLeads);
                console.error("Failed to update lead status");
            }
        } catch (error) {
            console.error(error);
            setLeads(originalLeads);
        }
    };

    const processedLeads = useMemo(() => {
        let filtered = leads.filter(lead => 
            (filterStatus === 'all' || lead.status === filterStatus) &&
            (!searchTerm || lead.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        filtered.sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;

            const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
            return sortDirection === 'asc' ? comparison : comparison * -1;
        });
        return filtered;
    }, [leads, filterStatus, searchTerm, sortField, sortDirection]);

    const handleSort = (field: LeadSortField) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);
    };
    
    const SortIcon: React.FC<{ field: LeadSortField }> = ({ field }) => {
        if (field !== sortField) return <ChevronDown className="w-3 h-3 text-gray-400 opacity-50" />;
        return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };
    
    const formatDate = (dateStr?: string) => dateStr ? format(parseISO(dateStr), 'dd/MM/yyyy', { locale: es }) : '-';

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
             <header className="mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <UsersRound className="w-8 h-8 text-primary" />
                        Gestión de Leads
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
                            <button
                                onClick={() => setView('list')}
                                title="Vista de Lista"
                                className={clsx("p-1.5 rounded-md transition-colors", view === 'list' ? 'bg-white dark:bg-gray-600 shadow text-primary' : 'text-gray-500 hover:text-gray-700')}>
                                <List className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setView('kanban')}
                                title="Vista de Tablero"
                                className={clsx("p-1.5 rounded-md transition-colors", view === 'kanban' ? 'bg-white dark:bg-gray-600 shadow text-primary' : 'text-gray-500 hover:text-gray-700')}>
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium">
                            <PlusCircle className="w-5 h-5" />
                            Nuevo Lead
                        </button>
                    </div>
                </div>
            </header>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4 p-3 bg-white dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as LeadStatus | 'all')}
                    className="text-sm border rounded-md p-1.5"
                >
                    <option value="all">Todos los Estados</option>
                    {Object.entries(leadStatusConfig).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            {loading ? <p>Cargando...</p> : (
                <main className="flex-grow">
                    {view === 'list' ? (
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg border">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            <button onClick={() => handleSort('name')} className="group inline-flex items-center gap-1">Nombre <SortIcon field="name" /></button>
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            <button onClick={() => handleSort('status')} className="group inline-flex items-center gap-1">Estado <SortIcon field="status" /></button>
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            <button onClick={() => handleSort('last_contact_date')} className="group inline-flex items-center gap-1">Último Contacto <SortIcon field="last_contact_date" /></button>
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            <button onClick={() => handleSort('created_at')} className="group inline-flex items-center gap-1">Fecha Creación <SortIcon field="created_at" /></button>
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-700">
                                    {processedLeads.map(lead => (
                                        <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-medium">{lead.name}</div>
                                                <div className="text-xs text-gray-500">{lead.email || lead.phone}</div>
                                            </td>
                                            <td className="px-4 py-3"><LeadStatusBadge status={lead.status} /></td>
                                            <td className="px-4 py-3"><InactivityAlert lastContactDate={lead.last_contact_date} /> {formatDate(lead.last_contact_date)}</td>
                                            <td className="px-4 py-3">{formatDate(lead.created_at)}</td>
                                            <td className="px-4 py-3 text-right space-x-1">
                                                 <button className="p-1 rounded hover:bg-gray-200" title="Ver Detalles"><Eye className="w-4 h-4" /></button>
                                                 <button className="p-1 rounded hover:bg-gray-200" title="Editar"><Edit className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <LeadsKanbanView leads={processedLeads} onLeadDrop={handleLeadStatusChange} />
                    )}
                </main>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Lead">
                <NewLeadForm onLeadCreated={handleLeadCreated} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
} 