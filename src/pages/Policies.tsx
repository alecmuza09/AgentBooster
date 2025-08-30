import { useState, useEffect, useMemo } from 'react';
import { Policy } from '@/types/policy';
import { getPolicies, updatePoliciesBulk, deletePolicies } from '@/data/policies';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/Modal';
import NewPolicyForm from '@/components/NewPolicyForm';
import { PolicyDocumentManager } from '@/components/PolicyDocumentManager';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
    FilePlus, MoreHorizontal, Filter, X, ChevronDown, ChevronUp, RefreshCw,
    Shield, Users, DollarSign, TrendingUp, FileText, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { ImportPolizasButton } from '@/components/import/ImportPolizasButton';
import { PolicyDetailModal } from '@/components/PolicyDetailModal';
import { PredictiveSearchInput } from '@/components/PredictiveSearchInput';
import { updatePolicyStatuses } from '@/utils/paymentUtils';
import { PolicyHistoryModule } from '@/components/PolicyHistoryModule';
import { RenewalAlertSystem } from '@/components/RenewalAlertSystem';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import BulkEditPoliciesModal from '@/components/BulkEditPoliciesModal';
import { es } from 'date-fns/locale';

export const Policies = () => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNewPolicyModalOpen, setIsNewPolicyModalOpen] = useState(false);
    const [selectedPolicyForDocs, setSelectedPolicyForDocs] = useState<Policy | null>(null);
    const [selectedPolicyForDetail, setSelectedPolicyForDetail] = useState<Policy | null>(null);
    const [selectedPolicyForHistory, setSelectedPolicyForHistory] = useState<Policy | null>(null);
    const [showRenewalAlerts, setShowRenewalAlerts] = useState(true);

    // Estados para filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [aseguradoraFilter, setAseguradoraFilter] = useState<string>('all');
    const [ramoFilter, setRamoFilter] = useState<string>('all');
    const [formaPagoFilter, setFormaPagoFilter] = useState<string>('all');
    const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<string>('policyNumber');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    // Calcular estadísticas de pólizas
    const policyStats = useMemo(() => {
        const total = policies.length;
        const active = policies.filter(p => p.status === 'active').length;
        const cancelled = policies.filter(p => p.status === 'cancelled').length;
        const pending = policies.filter(p => p.status === 'pending').length;
        const totalPremium = policies.reduce((sum, p) => sum + (Number((p as any).total ?? (p as any).primaNeta ?? 0)), 0);
        const avgPremium = total > 0 ? totalPremium / total : 0;
        const overduePolicies = policies.filter(p => {
            if (!p.fechaPagoActual) return false;
            const paymentDate = new Date(p.fechaPagoActual);
            return paymentDate < new Date();
        }).length;

        return {
            total,
            active,
            cancelled,
            pending,
            totalPremium,
            avgPremium,
            overduePolicies
        };
    }, [policies]);

    const fetchPolicies = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Fetching policies...');
            const data = await getPolicies();
            console.log('Policies fetched:', data);
            // Actualizar automáticamente los estados basados en vencimientos
            const updatedPolicies = updatePolicyStatuses(data);
            setPolicies(updatedPolicies);
        } catch (err: any) {
            console.error('Error fetching policies:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredAndSortedPolicies.map(p => p.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const toggleSelectOne = (id: string, checked: boolean) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (checked) next.add(id); else next.delete(id);
            return next;
        });
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        await deletePolicies(Array.from(selectedIds));
        await fetchPolicies();
        setSelectedIds(new Set());
    };

    const handleBulkApply = async (updates: any) => {
        if (selectedIds.size === 0) return;
        await updatePoliciesBulk(Array.from(selectedIds), updates);
        await fetchPolicies();
        setSelectedIds(new Set());
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    // Obtener valores únicos para los filtros
    const uniqueValues = useMemo(() => {
        const aseguradoras = [...new Set(policies.map(p => p.aseguradora))].sort();
        const ramos = [...new Set(policies.map(p => p.ramo))].sort();
        const formasPago = [...new Set(policies.map(p => p.formaDePago))].sort();
        const statuses = [...new Set(policies.map(p => p.status))].sort();
        
        return { aseguradoras, ramos, formasPago, statuses };
    }, [policies]);

    // Filtrar y ordenar políticas
    const filteredAndSortedPolicies = useMemo(() => {
        console.log('Filtering policies. Total policies:', policies.length);
        let filtered = policies.filter(policy => {
            // Búsqueda por texto mejorada (incluye RFC)
            const searchLower = searchTerm.toLowerCase();
            const aseguradoNombre = policy.asegurado?.nombre || '';
            const aseguradoRfc = policy.asegurado?.rfc || '';
            const contratanteNombre = policy.contratante?.nombre || '';
            const contratanteRfc = policy.contratante?.rfc || '';
            const aseguradoraNombre = policy.aseguradora || '';
            const policyNumberStr = policy.policyNumber || '';
            const matchesSearch = !searchTerm || 
                policyNumberStr.toLowerCase().includes(searchLower) ||
                contratanteNombre.toLowerCase().includes(searchLower) ||
                contratanteRfc.toLowerCase().includes(searchLower) ||
                aseguradoNombre.toLowerCase().includes(searchLower) ||
                aseguradoRfc.toLowerCase().includes(searchLower) ||
                aseguradoraNombre.toLowerCase().includes(searchLower);

            // Filtros
            const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
            const matchesAseguradora = aseguradoraFilter === 'all' || policy.aseguradora === aseguradoraFilter;
            const matchesRamo = ramoFilter === 'all' || policy.ramo === ramoFilter;
            const matchesFormaPago = formaPagoFilter === 'all' || policy.formaDePago === formaPagoFilter;

            // Filtro por rango de fechas
            let matchesDateRange = true;
            if (dateRangeFilter !== 'all' && policy.fechaPagoActual) {
                const paymentDate = new Date(policy.fechaPagoActual);
                const today = new Date();
                const daysDiff = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                switch (dateRangeFilter) {
                    case 'overdue':
                        matchesDateRange = daysDiff < 0;
                        break;
                    case 'due_soon':
                        matchesDateRange = daysDiff >= 0 && daysDiff <= 30;
                        break;
                    case 'this_month':
                        matchesDateRange = paymentDate.getMonth() === today.getMonth() && 
                                         paymentDate.getFullYear() === today.getFullYear();
                        break;
                    case 'next_month':
                        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                        const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
                        matchesDateRange = paymentDate >= nextMonth && paymentDate <= nextMonthEnd;
                        break;
                }
            }

            return matchesSearch && matchesStatus && matchesAseguradora && 
                   matchesRamo && matchesFormaPago && matchesDateRange;
        });

        // Ordenar
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'policyNumber':
                    aValue = a.policyNumber;
                    bValue = b.policyNumber;
                    break;
                case 'contratante':
                    aValue = a.contratante.nombre;
                    bValue = b.contratante.nombre;
                    break;
                case 'asegurado':
                    aValue = a.asegurado.nombre;
                    bValue = b.asegurado.nombre;
                    break;
                case 'aseguradora':
                    aValue = a.aseguradora;
                    bValue = b.aseguradora;
                    break;
                case 'ramo':
                    aValue = a.ramo;
                    bValue = b.ramo;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'fechaPago':
                    aValue = a.fechaPagoActual || '';
                    bValue = b.fechaPagoActual || '';
                    break;
                default:
                    aValue = a.policyNumber;
                    bValue = b.policyNumber;
            }

            const aStr = (aValue ?? '').toString();
            const bStr = (bValue ?? '').toString();
            return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
        });

        console.log('Filtered and sorted policies:', filtered.length);
        return filtered;
    }, [policies, searchTerm, statusFilter, aseguradoraFilter, ramoFilter, formaPagoFilter, dateRangeFilter, sortBy, sortOrder]);

    const isAllSelected = useMemo(() => (
        filteredAndSortedPolicies.length > 0 && filteredAndSortedPolicies.every(p => selectedIds.has(p.id))
    ), [filteredAndSortedPolicies, selectedIds]);

    const handlePolicyCreated = (newPolicy: Policy) => {
        setPolicies(prev => [newPolicy, ...prev]);
        setIsNewPolicyModalOpen(false);
    };

    // (opcional) abridor de gestor de documentos si se agrega acción en tabla

    const handleCloseDocumentManager = () => {
        setSelectedPolicyForDocs(null);
        fetchPolicies();
    };
    
    const handleDocumentsChange = (updatedDocs: any[]) => {
        if(selectedPolicyForDocs){
            setSelectedPolicyForDocs(prev => prev ? {...prev, documents: updatedDocs} : null);
            setPolicies(prev => prev.map(p => p.id === selectedPolicyForDocs.id ? {...p, documents: updatedDocs} : p))
        }
    }

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setAseguradoraFilter('all');
        setRamoFilter('all');
        setFormaPagoFilter('all');
        setDateRangeFilter('all');
        setSortBy('policyNumber');
        setSortOrder('asc');
    };

    const activeFiltersCount = [
        searchTerm,
        statusFilter !== 'all',
        aseguradoraFilter !== 'all',
        ramoFilter !== 'all',
        formaPagoFilter !== 'all',
        dateRangeFilter !== 'all'
    ].filter(Boolean).length;

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'expired': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'pending_renewal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'overdue_critical': return 'bg-red-600 text-white animate-pulse border-2 border-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Activa';
            case 'cancelled': return 'Cancelada';
            case 'pending': return 'Pendiente';
            case 'expired': return 'Expirada';
            case 'pending_renewal': return 'Renovación Pendiente';
            case 'overdue_critical': return '🚨 VENCIDO CRÍTICO';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-blue-600/10"></div>
                <div className="relative px-6 py-8 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                                    Gestión de Pólizas 🛡️
                                </h1>
                                <p className="text-lg text-slate-600 dark:text-slate-400">
                                    Administra y supervisa todas tus pólizas de seguros
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ImportPolizasButton />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowRenewalAlerts(!showRenewalAlerts)}
                                    className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    {showRenewalAlerts ? 'Ocultar' : 'Mostrar'} Renovaciones
                                </Button>
                                <Button 
                                    onClick={() => setIsNewPolicyModalOpen(true)}
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <FilePlus className="w-4 h-4 mr-2" />
                                    Nueva Póliza
                                </Button>
                            </div>
                        </div>
                        
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-3 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-purple-200 dark:border-purple-800 shadow-lg">
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                    {selectedIds.size} seleccionada{selectedIds.size !== 1 ? 's' : ''}
                                </Badge>
                                <Button variant="outline" size="sm" onClick={() => setIsBulkModalOpen(true)}>
                                    Editar seleccionadas
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                                    Borrar seleccionadas
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sistema de Alertas de Renovación */}
            {!isLoading && showRenewalAlerts && (
                <RenewalAlertSystem
                    policies={policies}
                    onProcessRenewal={(policyId) => {
                        // Actualizar el estado de la póliza cuando se procese la renovación
                        setPolicies(prev => prev.map(policy => 
                            policy.id === policyId 
                                ? { ...policy, status: 'pending_renewal' }
                                : policy
                        ));
                    }}
                    onViewPolicy={(policyId) => {
                        const policy = policies.find(p => p.id === policyId);
                        if (policy) setSelectedPolicyForDetail(policy);
                    }}
                />
            )}

            <div className="px-6 lg:px-8 pb-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    
                    {/* Sistema de Alertas de Renovación */}
                    {!isLoading && showRenewalAlerts && (
                        <RenewalAlertSystem
                            policies={policies}
                            onProcessRenewal={(policyId) => {
                                setPolicies(prev => prev.map(policy => 
                                    policy.id === policyId 
                                        ? { ...policy, status: 'pending_renewal' }
                                        : policy
                                ));
                            }}
                            onViewPolicy={(policyId) => {
                                const policy = policies.find(p => p.id === policyId);
                                if (policy) setSelectedPolicyForDetail(policy);
                            }}
                        />
                    )}

                    {/* Métricas principales */}
                    {!isLoading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                <CardContent className="p-6 relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                            {policyStats.total > 0 ? `${((policyStats.active / policyStats.total) * 100).toFixed(1)}%` : '0%'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold">{policyStats.total}</p>
                                        <p className="text-purple-100 text-sm">Total Pólizas</p>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm">
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        <span>{policyStats.active} activas</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                <CardContent className="p-6 relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                            {policyStats.total > 0 ? `${((policyStats.active / policyStats.total) * 100).toFixed(1)}%` : '0%'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold">{policyStats.active}</p>
                                        <p className="text-green-100 text-sm">Pólizas Activas</p>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm">
                                        <Shield className="w-4 h-4 mr-1" />
                                        <span>Vigentes y operativas</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                <CardContent className="p-6 relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                            {policyStats.overduePolicies > 0 ? '⚠️' : '✅'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold">{policyStats.overduePolicies}</p>
                                        <p className="text-orange-100 text-sm">Pólizas Vencidas</p>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>Requieren atención</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                <CardContent className="p-6 relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                            ${policyStats.avgPremium.toLocaleString()}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold">${(policyStats.totalPremium / 1000).toFixed(0)}K</p>
                                        <p className="text-indigo-100 text-sm">Prima Total</p>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm">
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        <span>Promedio por póliza</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

            {/* Filtros y Búsqueda */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                                <Filter className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-gray-900 dark:text-white">Filtros y Búsqueda</span>
                            {activeFiltersCount > 0 && (
                                <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                {showFilters ? 'Ocultar' : 'Mostrar'} filtros
                            </Button>
                            {activeFiltersCount > 0 && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={clearFilters}
                                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Limpiar
                                </Button>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Búsqueda principal con autocompletado */}
                    <PredictiveSearchInput
                        policies={policies}
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar por nombre, RFC, número de póliza, aseguradora..."
                    />

                    {/* Filtros expandibles */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            <div>
                                <Label htmlFor="status-filter">Estado</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        {uniqueValues.statuses.map(status => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="aseguradora-filter">Aseguradora</Label>
                                <Select value={aseguradoraFilter} onValueChange={setAseguradoraFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las aseguradoras" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las aseguradoras</SelectItem>
                                        {uniqueValues.aseguradoras.map(aseguradora => (
                                            <SelectItem key={aseguradora} value={aseguradora}>
                                                {aseguradora}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="ramo-filter">Ramo</Label>
                                <Select value={ramoFilter} onValueChange={setRamoFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los ramos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los ramos</SelectItem>
                                        {uniqueValues.ramos.map(ramo => (
                                            <SelectItem key={ramo} value={ramo}>
                                                {ramo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="forma-pago-filter">Forma de Pago</Label>
                                <Select value={formaPagoFilter} onValueChange={setFormaPagoFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las formas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las formas</SelectItem>
                                        {uniqueValues.formasPago.map(forma => (
                                            <SelectItem key={forma} value={forma}>
                                                {forma}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="date-range-filter">Rango de Fechas</Label>
                                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los períodos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los períodos</SelectItem>
                                        <SelectItem value="overdue">Vencidas</SelectItem>
                                        <SelectItem value="due_soon">Vencen pronto (30 días)</SelectItem>
                                        <SelectItem value="this_month">Este mes</SelectItem>
                                        <SelectItem value="next_month">Próximo mes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="sort-by">Ordenar por</Label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="policyNumber">Número de Póliza</SelectItem>
                                        <SelectItem value="contratante">Contratante</SelectItem>
                                        <SelectItem value="asegurado">Asegurado</SelectItem>
                                        <SelectItem value="aseguradora">Aseguradora</SelectItem>
                                        <SelectItem value="ramo">Ramo</SelectItem>
                                        <SelectItem value="status">Estado</SelectItem>
                                        <SelectItem value="fechaPago">Fecha de Pago</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Resumen de resultados */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <FileText className="w-4 h-4" />
                                <span className="font-medium">
                                    Mostrando {filteredAndSortedPolicies.length} de {policies.length} pólizas
                                </span>
                            </div>
                            {activeFiltersCount > 0 && (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} aplicado{activeFiltersCount !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Ordenado por:</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'} {sortBy}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <LoadingSpinner />
            ) : error ? (
                <div className="text-red-500 text-center p-4">{error}</div>
            ) : (
                <>
                    {/* Mensaje temporal de configuración */}
                    {policies.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <h3 className="text-yellow-800 font-medium mb-2">Configuración de Base de Datos</h3>
                            <p className="text-yellow-700 text-sm mb-2">
                                Para mostrar los registros reales de tu base de datos, necesitas configurar las credenciales de Supabase.
                            </p>
                            <div className="text-xs text-yellow-600 space-y-1">
                                <p>1. Crea un archivo <code>.env</code> en la raíz del proyecto</p>
                                <p>2. Añade las siguientes variables:</p>
                                <pre className="bg-yellow-100 p-2 rounded mt-2">
{`VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase`}
                                </pre>
                                <p>3. Reinicia la aplicación</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <TableHead className="w-8">
                                        <Checkbox checked={isAllSelected} onCheckedChange={(c) => toggleSelectAll(!!c)} />
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold text-gray-900 dark:text-white"
                                        onClick={() => handleSort('policyNumber')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            Número de Póliza
                                            {sortBy === 'policyNumber' && (
                                                <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold text-gray-900 dark:text-white"
                                        onClick={() => handleSort('contratante')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-green-600" />
                                            Contratante
                                            {sortBy === 'contratante' && (
                                                <span className="text-green-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold text-gray-900 dark:text-white"
                                        onClick={() => handleSort('asegurado')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-green-600" />
                                            Asegurado
                                            {sortBy === 'asegurado' && (
                                                <span className="text-green-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold text-gray-900 dark:text-white"
                                        onClick={() => handleSort('aseguradora')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-purple-600" />
                                            Aseguradora
                                            {sortBy === 'aseguradora' && (
                                                <span className="text-purple-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold text-gray-900 dark:text-white"
                                        onClick={() => handleSort('ramo')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-orange-600" />
                                            Ramo
                                            {sortBy === 'ramo' && (
                                                <span className="text-orange-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold text-gray-900 dark:text-white"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-indigo-600" />
                                            Estado
                                            {sortBy === 'status' && (
                                                <span className="text-indigo-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right font-semibold text-gray-900 dark:text-white">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedPolicies.length > 0 ? filteredAndSortedPolicies.map(policy => (
                                    <TableRow 
                                        key={policy.id} 
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-600"
                                    >
                                        <TableCell>
                                            <Checkbox checked={selectedIds.has(policy.id)} onCheckedChange={(c) => toggleSelectOne(policy.id, !!c)} />
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                {policy.policyNumber}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900 dark:text-white">{policy.contratante.nombre}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900 dark:text-white">{policy.asegurado.nombre}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                                    <Shield className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">{policy.aseguradora}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{policy.ramo}</div>
                                                {policy.subproducto && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{policy.subproducto}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge className={`${getStatusBadgeColor(policy.status)} font-medium`}>
                                                    {getStatusLabel(policy.status)}
                                                </Badge>
                                                {policy.fechaPagoActual && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {format(new Date(policy.fechaPagoActual), 'dd/MM/yyyy', { locale: es })}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedPolicyForHistory(policy)}
                                                    className="hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                                                    title="Ver historial y renovaciones"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedPolicyForDetail(policy)}
                                                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                                                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                                <div className="text-lg font-medium">
                                                    {searchTerm || activeFiltersCount > 0 
                                                        ? 'No se encontraron pólizas con los filtros aplicados'
                                                        : 'No hay pólizas registradas'
                                                    }
                                                </div>
                                                {!searchTerm && activeFiltersCount === 0 && (
                                                    <Button 
                                                        onClick={() => setIsNewPolicyModalOpen(true)}
                                                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        <FilePlus className="w-4 h-4 mr-2" />
                                                        Crear primera póliza
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}

            {/* Modales */}
            <Modal isOpen={isNewPolicyModalOpen} onClose={() => setIsNewPolicyModalOpen(false)} title="Nueva Póliza">
                <NewPolicyForm onPolicyCreated={handlePolicyCreated} />
            </Modal>

            <Modal isOpen={!!selectedPolicyForDocs} onClose={handleCloseDocumentManager} title="Gestión de Documentos">
                {selectedPolicyForDocs && (
                    <PolicyDocumentManager
                        policy={selectedPolicyForDocs}
                        onDocumentsChange={handleDocumentsChange}
                    />
                )}
            </Modal>

            <PolicyDetailModal
                policy={selectedPolicyForDetail}
                onClose={() => setSelectedPolicyForDetail(null)}
            />

            <BulkEditPoliciesModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onApply={handleBulkApply}
            />

            {/* Modal de Historial de Póliza */}
            <Modal 
                isOpen={!!selectedPolicyForHistory} 
                onClose={() => setSelectedPolicyForHistory(null)} 
                title={`Historial - ${selectedPolicyForHistory?.policyNumber || ''}`}
                size="xl"
            >
                {selectedPolicyForHistory && (
                    <PolicyHistoryModule
                        policy={selectedPolicyForHistory}
                        onUpdatePolicy={(updatedPolicy) => {
                            setPolicies(prev => prev.map(p => 
                                p.id === updatedPolicy.id ? updatedPolicy : p
                            ));
                        }}
                    />
                )}
            </Modal>
                </div>
            </div>
        </div>
    );
};