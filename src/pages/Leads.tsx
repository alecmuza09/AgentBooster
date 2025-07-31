import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
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

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-semibold">Leads</h1>
				<div className="flex items-center gap-2">
					<Button
						variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
						size="icon"
						onClick={() => setViewMode('kanban')}
					>
						<LayoutGrid className="w-5 h-5" />
					</Button>
					<Button
						variant={viewMode === 'list' ? 'secondary' : 'ghost'}
						size="icon"
						onClick={() => setViewMode('list')}
					>
						<List className="w-5 h-5" />
					</Button>
					<Button onClick={() => setIsModalOpen(true)}>Añadir Lead</Button>
				</div>
			</div>
			
			{isLoading ? (
				<LoadingSpinner />
			) : error ? (
				<div className="text-red-500 text-center">{error}</div>
			) : (
				<>
					{viewMode === 'kanban' && (
						<LeadsKanbanView 
							leads={leads} 
							onLeadStatusChange={handleLeadStatusChange} 
							onEditLead={handleEditClick} 
						/>
					)}
					{viewMode === 'list' && (
						<LeadsListView 
							leads={leads} 
							onLeadStatusChange={handleLeadStatusChange} 
							onEditLead={handleEditClick} 
						/>
					)}
				</>
			)}
			
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