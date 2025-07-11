import { useState, useEffect } from 'react';
import { Policy } from '@/types/policy';
import { getPolicies } from '@/data/policies';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/Modal';
import NewPolicyForm from '@/components/NewPolicyForm';
import { PolicyDocumentManager } from '@/components/PolicyDocumentManager';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FilePlus, FileText } from 'lucide-react';

export const Policies = () => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNewPolicyModalOpen, setIsNewPolicyModalOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

    const fetchPolicies = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getPolicies();
            setPolicies(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const handlePolicyCreated = (newPolicy: Policy) => {
        setPolicies(prev => [newPolicy, ...prev]);
        setIsNewPolicyModalOpen(false);
        // Podríamos llamar a fetchPolicies() de nuevo para asegurar consistencia
    };

    const handleOpenDocumentManager = (policy: Policy) => {
        setSelectedPolicy(policy);
    };

    const handleCloseDocumentManager = () => {
        setSelectedPolicy(null);
        // Opcional: Refrescar los datos por si se hicieron cambios
        fetchPolicies();
    };
    
    // Esta función se pasará a PolicyDocumentManager
    // Por ahora solo actualiza la UI, pero debería conectarse a la API
    const handleDocumentsChange = (updatedDocs: any[]) => {
        if(selectedPolicy){
            setSelectedPolicy(prev => prev ? {...prev, documents: updatedDocs} : null);
            setPolicies(prev => prev.map(p => p.id === selectedPolicy.id ? {...p, documents: updatedDocs} : p))
        }
    }

  return (
    <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Pólizas</h1>
                <Button onClick={() => setIsNewPolicyModalOpen(true)}>
                    <FilePlus className="mr-2 h-4 w-4" /> Añadir Póliza
                </Button>
      </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : error ? (
                <div className="text-red-500 text-center p-4">{error}</div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Número de Póliza</TableHead>
                                <TableHead>Asegurado</TableHead>
                                <TableHead>Aseguradora</TableHead>
                                <TableHead>Ramo</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {policies.length > 0 ? policies.map(policy => (
                                <TableRow key={policy.id}>
                                    <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                                    <TableCell>{policy.asegurado.nombre}</TableCell>
                                    <TableCell>{policy.aseguradora}</TableCell>
                                    <TableCell>{policy.ramo}</TableCell>
                                    <TableCell>{policy.status}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenDocumentManager(policy)}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Documentos ({policy.documents.length})
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No se encontraron pólizas.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
             </div>
         )}

            <Modal isOpen={isNewPolicyModalOpen} onClose={() => setIsNewPolicyModalOpen(false)} title="Crear Nueva Póliza">
                <NewPolicyForm onPolicyCreated={handlePolicyCreated} />
            </Modal>

            {selectedPolicy && (
                <Modal isOpen={!!selectedPolicy} onClose={handleCloseDocumentManager} title={`Documentos de la Póliza ${selectedPolicy.policyNumber}`}>
                    <PolicyDocumentManager 
                        policy={selectedPolicy} 
                        onDocumentsChange={handleDocumentsChange}
            />
        </Modal>
            )}
    </div>
  );
};