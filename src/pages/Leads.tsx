import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LayoutGrid, List, Plus, Users, Target, TrendingUp, Calendar, Phone, Mail, User, DollarSign, Search, Filter, RefreshCw, Download, Eye, EyeOff } from 'lucide-react';
import { LeadsKanbanView } from '@/components/LeadsKanbanView';
import { LeadsListView } from '@/components/LeadsListView';
import { Lead, LeadStatus } from '@/types/lead';
import { getLeads, updateLeadStatus, updateLead } from '@/data/leads';
import NewLeadForm from '@/components/NewLeadForm';
import { Modal } from '@/components/Modal';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const Leads = () => {
	const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
	const [leads, setLeads] = useState<Lead[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
	const [searchTerm, setSearchTerm] = useState('');

	const fetchLeads = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const fetchedLeads = await getLeads();
			setLeads(fetchedLeads);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchLeads();
	}, []);

	const handleLeadStatusChange = async (leadId: string, newStatus: string) => {
		try {
			const statusTyped = newStatus as LeadStatus;
			setLeads(prevLeads =>
				prevLeads.map(lead =>
					lead.id === leadId ? { ...lead, status: statusTyped } : lead
				)
			);
			await updateLeadStatus(leadId, statusTyped);
		} catch (error) {
			console.error("Failed to update lead status:", error);
			// Revertir el cambio en caso de error
			fetchLeads();
		}
	};

	const handleLeadCreated = (newLead: Lead) => {
		setLeads(prevLeads => [newLead, ...prevLeads]);
		setIsModalOpen(false);
	};

    const handleEditClick = (lead: Lead) => {
        setLeadToEdit(lead);
        setIsEditModalOpen(true);
    };

    const handleLeadUpdated = async (updatedLead: Lead) => {
        setLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? updatedLead : l));
        setIsEditModalOpen(false);
        setLeadToEdit(null);
    };

	// Calcular estadísticas de leads
	const stats = {
		totalLeads: leads.length,
		newLeads: leads.filter(l => l.status === 'Nuevo').length,
		contactedLeads: leads.filter(l => l.status === 'Contactado').length,
		proposalLeads: leads.filter(l => l.status === 'Propuesta').length,
		closedLeads: leads.filter(l => l.status === 'Cerrado').length,
		totalValue: leads.reduce((sum, lead) => sum + (lead.potentialValue || 0), 0),
		conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'Cerrado').length / leads.length) * 100).toFixed(1) : '0'
	};

	// Filtrar leads por término de búsqueda
	const filteredLeads = leads.filter(lead =>
		lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		lead.source?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
			{/* Header */}
			<div className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-600/10 to-teal-600/10"></div>
				<div className="relative px-6 py-8 lg:px-8">
					<div className="mx-auto max-w-7xl">
						<div className="flex items-center justify-between mb-8">
							<div>
								<h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
									Gestión de Leads 📊
								</h1>
								<p className="text-lg text-slate-600 dark:text-slate-400">
									Administra y sigue el progreso de tus prospectos
								</p>
							</div>
							<div className="flex items-center gap-3">
								<Button variant="outline" size="sm" onClick={fetchLeads}>
									<RefreshCw className="w-4 h-4 mr-2" />
									Actualizar
								</Button>
								<Button size="sm">
									<Download className="w-4 h-4 mr-2" />
									Exportar
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="px-6 lg:px-8 pb-8">
				<div className="mx-auto max-w-7xl space-y-8">
					
					{/* Métricas principales */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
							<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
							<CardContent className="p-6 relative z-10">
								<div className="flex items-center justify-between mb-4">
									<div className="p-2 bg-white/20 rounded-lg">
										<Users className="w-6 h-6" />
									</div>
									<Badge variant="secondary" className="bg-white/20 text-white border-0">
										{stats.conversionRate}%
									</Badge>
								</div>
								<div className="space-y-1">
									<p className="text-2xl font-bold">{stats.totalLeads}</p>
									<p className="text-green-100 text-sm">Total Leads</p>
								</div>
								<div className="mt-4 flex items-center text-sm">
									<TrendingUp className="w-4 h-4 mr-1" />
									<span>Tasa de conversión {stats.conversionRate}%</span>
								</div>
							</CardContent>
						</Card>

						<Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
							<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
							<CardContent className="p-6 relative z-10">
								<div className="flex items-center justify-between mb-4">
									<div className="p-2 bg-white/20 rounded-lg">
										<Target className="w-6 h-6" />
									</div>
									<Badge variant="secondary" className="bg-white/20 text-white border-0">
										{stats.newLeads}
									</Badge>
								</div>
								<div className="space-y-1">
									<p className="text-2xl font-bold">{stats.newLeads}</p>
									<p className="text-blue-100 text-sm">Nuevos Leads</p>
								</div>
								<div className="mt-4 flex items-center text-sm">
									<Calendar className="w-4 h-4 mr-1" />
									<span>Requieren atención</span>
								</div>
							</CardContent>
						</Card>

						<Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
							<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
							<CardContent className="p-6 relative z-10">
								<div className="flex items-center justify-between mb-4">
									<div className="p-2 bg-white/20 rounded-lg">
										<Phone className="w-6 h-6" />
									</div>
									<Badge variant="secondary" className="bg-white/20 text-white border-0">
										{stats.contactedLeads}
									</Badge>
								</div>
								<div className="space-y-1">
									<p className="text-2xl font-bold">{stats.contactedLeads}</p>
									<p className="text-purple-100 text-sm">Contactados</p>
								</div>
								<div className="mt-4 flex items-center text-sm">
									<Mail className="w-4 h-4 mr-1" />
									<span>En seguimiento</span>
								</div>
							</CardContent>
						</Card>

						<Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
							<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
							<CardContent className="p-6 relative z-10">
								<div className="flex items-center justify-between mb-4">
									<div className="p-2 bg-white/20 rounded-lg">
										<DollarSign className="w-6 h-6" />
									</div>
									<Badge variant="secondary" className="bg-white/20 text-white border-0">
										${(stats.totalValue / 1000).toFixed(0)}K
									</Badge>
								</div>
								<div className="space-y-1">
									<p className="text-2xl font-bold">${(stats.totalValue / 1000).toFixed(0)}K</p>
									<p className="text-orange-100 text-sm">Valor Total</p>
								</div>
								<div className="mt-4 flex items-center text-sm">
									<TrendingUp className="w-4 h-4 mr-1" />
									<span>Potencial de ventas</span>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Controles y búsqueda */}
					<Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
						<CardContent className="p-6">
							<div className="flex flex-col lg:flex-row items-center justify-between gap-4">
								<div className="flex items-center gap-4">
									{/* Búsqueda */}
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
										<input
											type="text"
											placeholder="Buscar leads..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-10 pr-4 py-2 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
										/>
									</div>
									
									{/* Filtros */}
									<Button variant="outline" size="sm">
										<Filter className="w-4 h-4 mr-2" />
										Filtros
									</Button>
								</div>

								<div className="flex items-center gap-3">
									{/* Toggle de vista */}
									<div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
										<Button
											variant={viewMode === 'kanban' ? 'default' : 'ghost'}
											size="sm"
											onClick={() => setViewMode('kanban')}
											className={viewMode === 'kanban' ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}
										>
											<LayoutGrid className="w-4 h-4 mr-2" />
											Kanban
										</Button>
										<Button
											variant={viewMode === 'list' ? 'default' : 'ghost'}
											size="sm"
											onClick={() => setViewMode('list')}
											className={viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}
										>
											<List className="w-4 h-4 mr-2" />
											Lista
										</Button>
									</div>

									{/* Botón agregar lead */}
									<Button 
										onClick={() => setIsModalOpen(true)}
										className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
									>
										<Plus className="w-4 h-4 mr-2" />
										Nuevo Lead
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
					
					{/* Contenido principal */}
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<LoadingSpinner />
						</div>
					) : error ? (
						<Card className="border-0 shadow-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
							<CardContent className="p-6">
								<div className="text-center text-red-800 dark:text-red-200">
									<p className="font-medium">Error al cargar leads</p>
									<p className="text-sm mt-1">{error}</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<>
							{viewMode === 'kanban' && (
								<LeadsKanbanView 
									leads={filteredLeads} 
									onLeadStatusChange={handleLeadStatusChange} 
									onEditLead={handleEditClick} 
								/>
							)}
							{viewMode === 'list' && (
								<LeadsListView 
									leads={filteredLeads} 
									onLeadStatusChange={handleLeadStatusChange} 
									onEditLead={handleEditClick} 
								/>
							)}
						</>
					)}
				</div>
			</div>
			
			{/* Modal para nuevo Lead */}
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Lead">
				<NewLeadForm onLeadCreated={handleLeadCreated} />
			</Modal>
            {/* Modal para editar Lead */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Lead">
                {leadToEdit && (
                    <NewLeadForm
                        onLeadCreated={handleLeadUpdated}
                        initialData={leadToEdit}
                        isEditMode={true}
                    />
                )}
            </Modal>
		</div>
	);
};

export default Leads;