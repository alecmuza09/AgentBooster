import React, { useState, useMemo } from 'react';
import { 
    LayoutDashboard, Wallet, PiggyBank, Briefcase, Handshake, HeartPulse, User, TrendingUp, Scale,
    DollarSign, CreditCard, Building, Car, Home, ShoppingCart, Utensils, Bus, Wifi, 
    Phone, GraduationCap, Gift, MedicalCross, Plane, Gamepad2, BookOpen, Coffee,
    TrendingDown, ArrowUpRight, ArrowDownRight, Target, PieChart, BarChart3, LineChart,
    Calendar, Clock, AlertCircle, CheckCircle, XCircle, Plus, Minus, Eye, Edit, Trash,
    Download, Share2, Filter, Search, ChevronRight, ChevronDown, Star, Award
} from 'lucide-react';
import clsx from 'clsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para datos financieros
interface Transaction {
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
    account: string;
    tags: string[];
}

interface FinancialGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    category: string;
    status: 'on-track' | 'behind' | 'completed';
}

interface Investment {
    id: string;
    name: string;
    type: string;
    amount: number;
    return: number;
    risk: 'low' | 'medium' | 'high';
    status: 'active' | 'sold';
}

const TABS = [
    { name: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
    { name: 'Datos Generales', icon: User, color: 'text-green-600' },
    { name: 'Ingresos', icon: Wallet, color: 'text-emerald-600' },
    { name: 'Gastos', icon: PiggyBank, color: 'text-red-600' },
    { name: 'Balance Financiero', icon: Scale, color: 'text-purple-600' },
    { name: 'Inversiones', icon: TrendingUp, color: 'text-orange-600' },
    { name: 'Gestión de Seguros', icon: HeartPulse, color: 'text-pink-600' },
];

// Datos dummy
const dummyTransactions: Transaction[] = [
    { id: '1', type: 'income', category: 'Salario', amount: 45000, description: 'Salario mensual', date: '2024-01-15', account: 'Banco Principal', tags: ['trabajo', 'mensual'] },
    { id: '2', type: 'income', category: 'Freelance', amount: 8000, description: 'Proyecto web', date: '2024-01-20', account: 'Banco Principal', tags: ['freelance', 'proyecto'] },
    { id: '3', type: 'expense', category: 'Vivienda', amount: 12000, description: 'Renta departamento', date: '2024-01-01', account: 'Banco Principal', tags: ['vivienda', 'renta'] },
    { id: '4', type: 'expense', category: 'Alimentación', amount: 3500, description: 'Supermercado', date: '2024-01-18', account: 'Tarjeta de Crédito', tags: ['alimentación', 'supermercado'] },
    { id: '5', type: 'expense', category: 'Transporte', amount: 1200, description: 'Gasolina', date: '2024-01-19', account: 'Efectivo', tags: ['transporte', 'gasolina'] },
    { id: '6', type: 'expense', category: 'Entretenimiento', amount: 800, description: 'Cine y restaurante', date: '2024-01-21', account: 'Tarjeta de Crédito', tags: ['entretenimiento', 'ocio'] },
];

const dummyGoals: FinancialGoal[] = [
    { id: '1', name: 'Fondo de Emergencia', targetAmount: 100000, currentAmount: 75000, deadline: '2024-06-30', category: 'Ahorro', status: 'on-track' },
    { id: '2', name: 'Vacaciones Europa', targetAmount: 150000, currentAmount: 45000, deadline: '2024-12-31', category: 'Viajes', status: 'behind' },
    { id: '3', name: 'Enganche Casa', targetAmount: 500000, currentAmount: 180000, deadline: '2025-06-30', category: 'Vivienda', status: 'on-track' },
];

const dummyInvestments: Investment[] = [
    { id: '1', name: 'Fondo Indexado S&P 500', type: 'ETF', amount: 50000, return: 12.5, risk: 'medium', status: 'active' },
    { id: '2', name: 'Bonos del Gobierno', type: 'Bonos', amount: 30000, return: 5.2, risk: 'low', status: 'active' },
    { id: '3', name: 'Criptomonedas', type: 'Crypto', amount: 15000, return: -8.3, risk: 'high', status: 'active' },
];

export const Finanzas360 = () => {
    const [activeTab, setActiveTab] = useState(TABS[0].name);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Cálculos financieros
    const financialStats = useMemo(() => {
        const totalIncome = dummyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = dummyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netIncome = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
        
        const totalInvestments = dummyInvestments
            .filter(i => i.status === 'active')
            .reduce((sum, i) => sum + i.amount, 0);
        
        const totalGoals = dummyGoals.reduce((sum, g) => sum + g.targetAmount, 0);
        const currentGoals = dummyGoals.reduce((sum, g) => sum + g.currentAmount, 0);
        const goalsProgress = totalGoals > 0 ? (currentGoals / totalGoals) * 100 : 0;

        return {
            totalIncome,
            totalExpenses,
            netIncome,
            savingsRate,
            totalInvestments,
            totalGoals,
            currentGoals,
            goalsProgress
        };
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'on-track': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'behind': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return (
                    <div className="space-y-6">
                        {/* Estadísticas principales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Ingresos Totales</p>
                                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                {formatCurrency(financialStats.totalIncome)}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                                            <ArrowUpRight className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-red-600 dark:text-red-400">Gastos Totales</p>
                                            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                                                {formatCurrency(financialStats.totalExpenses)}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50">
                                            <ArrowDownRight className="w-6 h-6 text-red-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Ingreso Neto</p>
                                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                                {formatCurrency(financialStats.netIncome)}
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                {financialStats.savingsRate.toFixed(1)}% de ahorro
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                                            <Target className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Inversiones</p>
                                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                                {formatCurrency(financialStats.totalInvestments)}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
                                            <TrendingUp className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Metas financieras */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-purple-600" />
                                    Metas Financieras
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {dummyGoals.map((goal) => (
                                        <div key={goal.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h4>
                                                    <Badge className={getStatusColor(goal.status)}>
                                                        {goal.status === 'on-track' ? 'En camino' : 
                                                         goal.status === 'behind' ? 'Atrasado' : 'Completado'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                                                    <span>Vence: {format(new Date(goal.deadline), 'dd/MM/yyyy', { locale: es })}</span>
                                                </div>
                                                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'Datos Generales':
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-green-600" />
                                    Información Personal
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                                            <p className="text-lg text-gray-900 dark:text-white">Juan Carlos Pérez González</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Edad</label>
                                            <p className="text-lg text-gray-900 dark:text-white">32 años</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado Civil</label>
                                            <p className="text-lg text-gray-900 dark:text-white">Casado</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Profesión</label>
                                            <p className="text-lg text-gray-900 dark:text-white">Ingeniero de Software</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ingresos Anuales</label>
                                            <p className="text-lg text-gray-900 dark:text-white">{formatCurrency(540000)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Perfil de Riesgo</label>
                                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                Moderado
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'Ingresos':
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-emerald-600" />
                                    Historial de Ingresos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {dummyTransactions.filter(t => t.type === 'income').map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                                                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{transaction.description}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.category}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: es })} • {transaction.account}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                    +{formatCurrency(transaction.amount)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'Gastos':
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PiggyBank className="w-5 h-5 text-red-600" />
                                    Historial de Gastos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {dummyTransactions.filter(t => t.type === 'expense').map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
                                                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{transaction.description}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.category}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: es })} • {transaction.account}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                                    -{formatCurrency(transaction.amount)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'Balance Financiero':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Scale className="w-5 h-5 text-purple-600" />
                                        Resumen Mensual
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Ingresos</span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(financialStats.totalIncome)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Gastos</span>
                                            <span className="font-semibold text-red-600 dark:text-red-400">
                                                {formatCurrency(financialStats.totalExpenses)}
                                            </span>
                                        </div>
                                        <hr className="border-gray-200 dark:border-gray-700" />
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-900 dark:text-white">Balance Neto</span>
                                            <span className={`font-bold text-lg ${
                                                financialStats.netIncome >= 0 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {formatCurrency(financialStats.netIncome)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-orange-600" />
                                        Distribución de Gastos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                <span className="text-sm">Vivienda</span>
                                            </div>
                                            <span className="text-sm font-medium">40%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <span className="text-sm">Alimentación</span>
                                            </div>
                                            <span className="text-sm font-medium">25%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                <span className="text-sm">Transporte</span>
                                            </div>
                                            <span className="text-sm font-medium">15%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                                <span className="text-sm">Otros</span>
                                            </div>
                                            <span className="text-sm font-medium">20%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            case 'Inversiones':
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-orange-600" />
                                    Cartera de Inversiones
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {dummyInvestments.map((investment) => (
                                        <div key={investment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/50">
                                                    <TrendingUp className="w-5 h-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{investment.name}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{investment.type}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge className={getRiskColor(investment.risk)}>
                                                            {investment.risk === 'low' ? 'Bajo' : 
                                                             investment.risk === 'medium' ? 'Medio' : 'Alto'}
                                                        </Badge>
                                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {investment.status === 'active' ? 'Activo' : 'Vendido'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(investment.amount)}
                                                </p>
                                                <p className={`text-sm font-medium ${
                                                    investment.return >= 0 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {investment.return >= 0 ? '+' : ''}{investment.return}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'Gestión de Seguros':
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <HeartPulse className="w-5 h-5 text-pink-600" />
                                    Pólizas Activas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                                                <HeartPulse className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">Seguro de Vida</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Cobertura: $2,000,000</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                                    Prima mensual: {formatCurrency(2500)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            Activo
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                                                <Car className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">Seguro de Auto</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Cobertura: Responsabilidad Civil</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                                    Prima mensual: {formatCurrency(1800)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            Activo
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
                                                <Home className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">Seguro de Hogar</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Cobertura: Contenido y Estructura</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                                    Prima mensual: {formatCurrency(1200)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            Activo
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
            {/* Header mejorado */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50">
                                <Briefcase className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Finanzas Personales 360°
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Una vista completa de tu salud financiera y planificación integral
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Acciones principales */}
                    <div className="flex flex-wrap gap-3">
                        <Button 
                            variant="outline"
                            className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Exportar Reporte
                        </Button>
                        <Button 
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Plus className="h-4 w-4" />
                            Nueva Transacción
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navegación de Pestañas (Vertical) */}
                <aside className="lg:w-1/5">
                    <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                Módulos Financieros
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <nav className="flex flex-col gap-2">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.name}
                                        onClick={() => setActiveTab(tab.name)}
                                        className={clsx(
                                            'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                                            activeTab === tab.name
                                                ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 text-purple-700 dark:text-purple-300 shadow-md'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                        )}
                                    >
                                        <tab.icon className={clsx("w-5 h-5", activeTab === tab.name ? tab.color : "text-gray-500 dark:text-gray-400")} />
                                        <span>{tab.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </CardContent>
                    </Card>
                </aside>

                {/* Contenido Principal */}
                <main className="flex-grow lg:w-4/5">
                    <Card className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    {(() => {
                                        const activeTabData = TABS.find(tab => tab.name === activeTab);
                                        return activeTabData ? <activeTabData.icon className="w-5 h-5" /> : null;
                                    })()}
                                    {activeTab}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Share2 className="w-4 h-4 mr-1" />
                                        Compartir
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {renderContent()}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default Finanzas360; 