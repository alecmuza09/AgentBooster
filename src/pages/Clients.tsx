import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { Modal } from '../components/Modal';
import { NewClientForm } from '../components/NewClientForm';
import { Client } from '../types/client';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const StatusBadge: React.FC<{ status: Client['status'] }> = ({ status }) => {
    const statusConfig = {
        Activo: { text: 'Activo', className: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' },
        Inactivo: { text: 'Inactivo', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300' },
        Prospecto: { text: 'Prospecto', className: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' },
    };
    const config = statusConfig[status] || statusConfig.Inactivo;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
            {config.text}
        </span>
    );
};

export const Clients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchClients = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('agent_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setClients(data);
            } catch (error) {
                console.error('Error al cargar clientes:', error);
                // Aquí podrías mostrar una notificación de error al usuario
            } finally {
                setIsLoading(false);
            }
        };

        fetchClients();
    }, [user]);

    const handleClientCreated = (newClient: Client) => {
        setClients(prevClients => [newClient, ...prevClients]);
        setIsModalOpen(false);
    };
    
    const filteredClients = useMemo(() => {
        if (!searchTerm) {
            return clients;
        }
        const lowerSearch = searchTerm.toLowerCase();
        return clients.filter(client =>
            (client.name && client.name.toLowerCase().includes(lowerSearch)) ||
            (client.rfc && client.rfc.toLowerCase().includes(lowerSearch)) ||
            (client.email && client.email.toLowerCase().includes(lowerSearch))
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
                                {isLoading ? (
                                    <tr><td colSpan={4} className="text-center py-8"><LoadingSpinner /></td></tr>
                                ) : filteredClients.length > 0 ? (
                                    filteredClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{client.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{client.rfc || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{client.email || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <StatusBadge status={client.status} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No tienes clientes registrados todavía. ¡Crea el primero!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo Cliente">
                    <NewClientForm
                        onClientCreated={handleClientCreated}
                        onClose={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
};