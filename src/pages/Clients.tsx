import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { Modal } from '../components/Modal';
import NewClientForm from '../components/NewClientForm';
import { Client, ClientStatus } from '../types/client';
import { exampleClients } from '../data/clients';

// Componentes pequeños y helpers se pueden mantener si no tienen lógica compleja
const StatusBadge: React.FC<{ status: ClientStatus }> = ({ status }) => {
    const config = {
        active: { text: 'Activo', color: 'green' },
        inactive: { text: 'Inactivo', color: 'gray' },
        prospect: { text: 'Prospecto', color: 'blue' },
    };
    const { text, color } = config[status] || { text: 'Desconocido', color: 'gray' };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
            {text}
        </span>
    );
};

export const Clients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/clients');
            if (!response.ok) {
                throw new Error('Error al cargar clientes');
            }
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error(error);
            setClients(exampleClients); // Cargar datos de ejemplo si falla
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleClientAdded = () => {
        setIsModalOpen(false);
        fetchClients();
    };

    // Lógica de filtrado simplificada dentro del useMemo
    const filteredClients = useMemo(() => {
        if (!searchTerm) {
            return clients;
        }
        const lowerSearch = searchTerm.toLowerCase();
        return clients.filter(client =>
            client.name.toLowerCase().includes(lowerSearch) ||
            client.rfc.toLowerCase().includes(lowerSearch) ||
            client.email.toLowerCase().includes(lowerSearch)
        );
    }, [clients, searchTerm]);

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Gestión de Clientes</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Nuevo Cliente
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                <div className="flex items-center mb-4">
                    <Search className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, RFC, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                {isLoading ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">Cargando clientes...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFC</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {filteredClients.length > 0 ? (
                                    filteredClients.map((client) => (
                                        <tr key={client.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{client.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{client.rfc}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{client.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <StatusBadge status={client.status} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No se encontraron clientes que coincidan con la búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo Cliente">
                <NewClientForm
                    onSubmit={handleClientAdded}
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};