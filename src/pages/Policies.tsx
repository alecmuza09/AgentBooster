import { useState, useEffect, useMemo } from 'react';
import { Policy } from '@/types/policy';
import { getPolicies } from '@/data/policies';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/Modal';
import NewPolicyForm from '@/components/NewPolicyForm';
import { PolicyDocumentManager } from '@/components/PolicyDocumentManager';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
    FilePlus, MoreHorizontal, Search, Filter, X, Calendar, ChevronDown, ChevronUp,
    Shield, Users, DollarSign, TrendingUp, FileText, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { ImportPolizasButton } from '@/components/import/ImportPolizasButton';
import { PolicyDetailModal } from '@/components/PolicyDetailModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const Policies = () => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNewPolicyModalOpen, setIsNewPolicyModalOpen] = useState(false);
    const [selectedPolicyForDocs, setSelectedPolicyForDocs] = useState<Policy | null>(null);
    const [selectedPolicyForDetail, setSelectedPolicyForDetail] = useState<Policy | null>(null);

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

    // Calcular estadísticas de pólizas
    const policyStats = useMemo(() => {
        const total = policies.length;
        const active = policies.filter(p => p.status === 'active').length;
        const cancelled = policies.filter(p => p.status === 'cancelled').length;
        const pending = policies.filter(p => p.status === 'pending').length;
        const totalPremium = policies.reduce((sum, p) => sum + (p.premiumAmount || 0), 0);
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
            setPolicies(data);
        } catch (err: any) {
            console.error('Error fetching policies:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
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
            // Búsqueda por texto
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                policy.policyNumber.toLowerCase().includes(searchLower) ||
                policy.contratante.nombre.toLowerCase().includes(searchLower) ||
                policy.asegurado.nombre.toLowerCase().includes(searchLower) ||
                policy.aseguradora.toLowerCase().includes(searchLower);

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

            if (sortOrder === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });

        console.log('Filtered and sorted policies:', filtered.length);
        return filtered;
    }, [policies, searchTerm, statusFilter, aseguradoraFilter, ramoFilter, formaPagoFilter, dateRangeFilter, sortBy, sortOrder]);

    const handlePolicyCreated = (newPolicy: Policy) => {
        setPolicies(prev => [newPolicy, ...prev]);
        setIsNewPolicyModalOpen(false);
    };

    const handleOpenDocumentManager = (policy: Policy) => {
        setSelectedPolicyForDocs(policy);
    };

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
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
            {/* Header mejorado */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Gestión de Pólizas
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Administra y supervisa todas tus pólizas de seguros
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Acciones principales */}
                    <div className="flex flex-wrap gap-3">
                        <ImportPolizasButton />
                        <Button 
                            onClick={() => setIsNewPolicyModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <FilePlus className="h-4 w-4" />
                            Nueva Póliza
                        </Button>
                    </div>
                </div>
            </div>

            {/* Estadísticas de Pólizas */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Pólizas</p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{policyStats.total}</p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Pólizas Activas</p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{policyStats.active}</p>
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        {policyStats.total > 0 ? `${((policyStats.active / policyStats.total) * 100).toFixed(1)}%` : '0%'} del total
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Pólizas Vencidas</p>
                                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{policyStats.overduePolicies}</p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400">
                                        Requieren atención
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50">
                                    <AlertCircle className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Prima Total</p>
                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                        ${policyStats.totalPremium.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400">
                                        Promedio: ${policyStats.avgPremium.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
                                    <DollarSign className="w-6 h-6 text-purple-600" />
                                </div>
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
                    {/* Búsqueda principal */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Search className="h-5 w-5" />
                        </div>
                        <Input
                            placeholder="Buscar por número de póliza, cliente, aseguradora..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-12 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                        />
                    </div>

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
                                        <TableCell className="font-medium text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                {policy.policyNumber}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{policy.asegurado.nombre}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {policy.contratante.nombre !== policy.asegurado.nombre && 
                                                        `Contratante: ${policy.contratante.nombre}`
                                                    }
                                                </div>
                                            </div>
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
                                                    {policy.status}
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedPolicyForDetail(policy)}
                                                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
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
        </div>
    );
};