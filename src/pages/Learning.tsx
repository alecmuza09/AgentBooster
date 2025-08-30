import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
    BookOpen, Search, Filter, Play, Clock, Star, Users, Award, 
    TrendingUp, Target, Shield, DollarSign, GraduationCap, 
    Video, FileText, Headphones, CheckCircle, Lock, Unlock,
    ChevronRight, Calendar, Bookmark, Share2, Download,
    Zap, Trophy, Brain, Lightbulb, Rocket, Crown, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para el contenido de aprendizaje
interface LearningContent {
    id: string;
    title: string;
    description: string;
    category: 'video' | 'documento' | 'audio' | 'curso' | 'webinar';
    difficulty: 'principiante' | 'intermedio' | 'avanzado';
    duration: number; // en minutos
    rating: number;
    students: number;
    instructor: string;
    thumbnail?: string;
    tags: string[];
    isCompleted?: boolean;
    isBookmarked?: boolean;
    isPremium?: boolean;
    createdAt: string;
    updatedAt: string;
}

// Contenido dummy
const dummyLearningContent: LearningContent[] = [
    {
        id: '1',
        title: 'Fundamentos de Seguros de Vida',
        description: 'Aprende los conceptos básicos de los seguros de vida, tipos de pólizas y cómo explicarlos a tus clientes.',
        category: 'curso',
        difficulty: 'principiante',
        duration: 120,
        rating: 4.8,
        students: 1247,
        instructor: 'María González',
        tags: ['vida', 'básico', 'ventas'],
        isCompleted: false,
        isBookmarked: true,
        isPremium: false,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
    },
    {
        id: '2',
        title: 'Técnicas Avanzadas de Ventas',
        description: 'Domina las técnicas más efectivas para cerrar ventas de seguros y construir relaciones duraderas con clientes.',
        category: 'video',
        difficulty: 'avanzado',
        duration: 45,
        rating: 4.9,
        students: 892,
        instructor: 'Carlos Mendoza',
        tags: ['ventas', 'técnicas', 'avanzado'],
        isCompleted: true,
        isBookmarked: false,
        isPremium: true,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18'
    },
    {
        id: '3',
        title: 'Regulaciones y Cumplimiento 2024',
        description: 'Actualización completa sobre las nuevas regulaciones del sector asegurador y cómo cumplir con los requisitos.',
        category: 'documento',
        difficulty: 'intermedio',
        duration: 90,
        rating: 4.7,
        students: 567,
        instructor: 'Lic. Ana Torres',
        tags: ['regulaciones', 'cumplimiento', 'legal'],
        isCompleted: false,
        isBookmarked: true,
        isPremium: false,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-15'
    },
    {
        id: '4',
        title: 'Seguros de Auto: Todo lo que Necesitas Saber',
        description: 'Guía completa sobre seguros automotrices, coberturas, siniestros y atención al cliente.',
        category: 'audio',
        difficulty: 'intermedio',
        duration: 75,
        rating: 4.6,
        students: 1103,
        instructor: 'Roberto Silva',
        tags: ['auto', 'coberturas', 'siniestros'],
        isCompleted: false,
        isBookmarked: false,
        isPremium: false,
        createdAt: '2024-01-12',
        updatedAt: '2024-01-16'
    },
    {
        id: '5',
        title: 'Webinar: Tendencias del Mercado 2024',
        description: 'Análisis de las tendencias emergentes en el mercado de seguros y oportunidades de negocio.',
        category: 'webinar',
        difficulty: 'intermedio',
        duration: 60,
        rating: 4.5,
        students: 2341,
        instructor: 'Dr. Laura Martínez',
        tags: ['tendencias', 'mercado', 'oportunidades'],
        isCompleted: false,
        isBookmarked: true,
        isPremium: true,
        createdAt: '2024-01-08',
        updatedAt: '2024-01-14'
    },
    {
        id: '6',
        title: 'Gestión de Cartera de Clientes',
        description: 'Estrategias efectivas para gestionar y expandir tu cartera de clientes de seguros.',
        category: 'curso',
        difficulty: 'avanzado',
        duration: 150,
        rating: 4.8,
        students: 678,
        instructor: 'Patricia López',
        tags: ['gestión', 'cartera', 'clientes'],
        isCompleted: false,
        isBookmarked: false,
        isPremium: true,
        createdAt: '2024-01-03',
        updatedAt: '2024-01-12'
    },
    {
        id: '7',
        title: 'Seguros Empresariales Básicos',
        description: 'Introducción a los seguros empresariales, tipos de cobertura y procesos de cotización.',
        category: 'video',
        difficulty: 'principiante',
        duration: 55,
        rating: 4.4,
        students: 445,
        instructor: 'Ing. Miguel Ángel',
        tags: ['empresarial', 'básico', 'cotización'],
        isCompleted: false,
        isBookmarked: false,
        isPremium: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-22'
    },
    {
        id: '8',
        title: 'Certificación en Seguros de Salud',
        description: 'Programa completo para obtener la certificación en seguros de salud y gastos médicos.',
        category: 'curso',
        difficulty: 'avanzado',
        duration: 300,
        rating: 4.9,
        students: 1234,
        instructor: 'Dr. Carmen Ruiz',
        tags: ['salud', 'certificación', 'médicos'],
        isCompleted: false,
        isBookmarked: true,
        isPremium: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-25'
    }
];

export const Learning = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [showCompleted, setShowCompleted] = useState(false);
    const [showBookmarked, setShowBookmarked] = useState(false);

    // Estadísticas del usuario
    const userStats = useMemo(() => {
        const total = dummyLearningContent.length;
        const completed = dummyLearningContent.filter(item => item.isCompleted).length;
        const bookmarked = dummyLearningContent.filter(item => item.isBookmarked).length;
        const inProgress = total - completed;
        const totalHours = dummyLearningContent.reduce((sum, item) => sum + item.duration, 0) / 60;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        return {
            total,
            completed,
            bookmarked,
            inProgress,
            totalHours: Math.round(totalHours * 10) / 10,
            completionRate: Math.round(completionRate * 10) / 10
        };
    }, []);

    // Filtrar contenido
    const filteredContent = useMemo(() => {
        return dummyLearningContent.filter(item => {
            const matchesSearch = !searchTerm || 
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            const matchesDifficulty = difficultyFilter === 'all' || item.difficulty === difficultyFilter;
            const matchesCompleted = !showCompleted || item.isCompleted;
            const matchesBookmarked = !showBookmarked || item.isBookmarked;

            return matchesSearch && matchesCategory && matchesDifficulty && matchesCompleted && matchesBookmarked;
        });
    }, [searchTerm, categoryFilter, difficultyFilter, showCompleted, showBookmarked]);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'video': return Video;
            case 'documento': return FileText;
            case 'audio': return Headphones;
            case 'curso': return GraduationCap;
            case 'webinar': return Users;
            default: return BookOpen;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'principiante': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'intermedio': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'avanzado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            {/* Header Principal con Gradiente Elegante */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900">
                {/* Elementos decorativos de fondo */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
                </div>
                
                <div className="relative px-6 py-8 lg:px-8 lg:py-12">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                            {/* Título y Descripción */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-30"></div>
                                        <div className="relative p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                            <GraduationCap className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                                            Centro de Aprendizaje
                                        </h1>
                                        <p className="text-xl text-blue-100 mt-2 max-w-2xl">
                                            Domina el arte de los seguros con contenido premium diseñado para impulsar tu carrera profesional
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Progreso de aprendizaje */}
                                <div className="max-w-md space-y-2">
                                    <div className="flex justify-between text-sm text-blue-100">
                                        <span>Progreso General</span>
                                        <span>{userStats.completionRate}%</span>
                                    </div>
                                    <Progress 
                                        value={userStats.completionRate} 
                                        className="h-3 bg-white/20"
                                    />
                                    <p className="text-xs text-blue-200">
                                        {userStats.completed} de {userStats.total} cursos completados
                                    </p>
                                </div>
                            </div>
                            
                            {/* Acciones principales */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button 
                                    variant="outline"
                                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                                >
                                    <Bookmark className="h-4 w-4 mr-2" />
                                    Mis Favoritos
                                </Button>
                                <Button 
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <Trophy className="h-4 w-4 mr-2" />
                                    Mis Certificaciones
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-8 lg:px-8 lg:py-12">
                <div className="mx-auto max-w-7xl space-y-8">
                    {/* Métricas Principales con Glassmorphism */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 border-0 shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <CardContent className="relative p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-blue-100 text-sm font-medium">Total Cursos</p>
                                        <p className="text-3xl font-bold">{userStats.total}</p>
                                        <p className="text-blue-200 text-xs">Disponibles</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 border-0 shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <CardContent className="relative p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-green-100 text-sm font-medium">Completados</p>
                                        <p className="text-3xl font-bold">{userStats.completed}</p>
                                        <p className="text-green-200 text-xs">{userStats.completionRate}% del total</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 border-0 shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <CardContent className="relative p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-amber-100 text-sm font-medium">En Progreso</p>
                                        <p className="text-3xl font-bold">{userStats.inProgress}</p>
                                        <p className="text-amber-200 text-xs">Cursos activos</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 border-0 shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <CardContent className="relative p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-purple-100 text-sm font-medium">Favoritos</p>
                                        <p className="text-3xl font-bold">{userStats.bookmarked}</p>
                                        <p className="text-purple-200 text-xs">Guardados</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                        <Bookmark className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 border-0 shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <CardContent className="relative p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-orange-100 text-sm font-medium">Horas Totales</p>
                                        <p className="text-3xl font-bold">{userStats.totalHours}h</p>
                                        <p className="text-orange-200 text-xs">Contenido disponible</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                        <Target className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Panel de Búsqueda y Filtros Mejorado */}
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
                            <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
                                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                                    <Search className="h-5 w-5 text-white" />
                                </div>
                                <span>Explorar Contenido de Aprendizaje</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            {/* Búsqueda principal mejorada */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                                    <Search className="h-5 w-5" />
                                </div>
                                <Input
                                    placeholder="Buscar por título, descripción, instructor o etiquetas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-14 text-base border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm"
                                />
                            </div>

                            {/* Filtros organizados */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categoría</label>
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50">
                                            <SelectValue placeholder="Todas las categorías" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las categorías</SelectItem>
                                            <SelectItem value="video">Videos</SelectItem>
                                            <SelectItem value="documento">Documentos</SelectItem>
                                            <SelectItem value="audio">Audio</SelectItem>
                                            <SelectItem value="curso">Cursos</SelectItem>
                                            <SelectItem value="webinar">Webinars</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dificultad</label>
                                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                                        <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50">
                                            <SelectValue placeholder="Todas las dificultades" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las dificultades</SelectItem>
                                            <SelectItem value="principiante">Principiante</SelectItem>
                                            <SelectItem value="intermedio">Intermedio</SelectItem>
                                            <SelectItem value="avanzado">Avanzado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                    <input
                                        type="checkbox"
                                        id="showCompleted"
                                        checked={showCompleted}
                                        onChange={(e) => setShowCompleted(e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="showCompleted" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Solo completados
                                    </label>
                                </div>

                                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                    <input
                                        type="checkbox"
                                        id="showBookmarked"
                                        checked={showBookmarked}
                                        onChange={(e) => setShowBookmarked(e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="showBookmarked" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Solo favoritos
                                    </label>
                                </div>
                            </div>

                            {/* Resumen de resultados mejorado */}
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                                        <BookOpen className="w-4 h-4" />
                                        <span className="font-semibold">
                                            Mostrando {filteredContent.length} de {dummyLearningContent.length} recursos
                                        </span>
                                    </div>
                                </div>
                                <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300">
                                    <Zap className="w-3 h-3 mr-1" />
                                    Contenido Premium Disponible
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Grid de contenido mejorado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredContent.map((item) => {
                            const CategoryIcon = getCategoryIcon(item.category);
                            return (
                                <Card 
                                    key={item.id} 
                                    className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                                >
                                    {/* Header de la card con gradiente */}
                                    <div className="relative h-40 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-700 flex items-center justify-center overflow-hidden">
                                        {/* Elementos decorativos */}
                                        <div className="absolute inset-0 opacity-30">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:15px_15px]"></div>
                                        </div>
                                        
                                        <div className="relative z-10 p-6 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                                            <CategoryIcon className="w-12 h-12 text-white" />
                                        </div>
                                        
                                        {/* Badges superpuestos */}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <Badge className={`${getDifficultyColor(item.difficulty)} backdrop-blur-sm border-0`}>
                                                {item.difficulty}
                                            </Badge>
                                            {item.isPremium && (
                                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 backdrop-blur-sm">
                                                    <Crown className="w-3 h-3 mr-1" />
                                                    Premium
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
                                            >
                                                <Bookmark className="w-4 h-4 text-white" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
                                            >
                                                <Share2 className="w-4 h-4 text-white" />
                                            </Button>
                                        </div>

                                        {/* Indicador de completado */}
                                        {item.isCompleted && (
                                            <div className="absolute bottom-3 right-3">
                                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                                                    <CheckCircle className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contenido de la card */}
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* Metadatos mejorados */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDuration(item.duration)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {item.students.toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {item.rating}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    {item.instructor}
                                                </span>
                                            </div>

                                            {/* Etiquetas mejoradas */}
                                            <div className="flex flex-wrap gap-1">
                                                {item.tags.slice(0, 2).map((tag, index) => (
                                                    <Badge 
                                                        key={index} 
                                                        variant="outline" 
                                                        className="text-xs px-2 py-1 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {item.tags.length > 2 && (
                                                    <Badge 
                                                        variant="outline" 
                                                        className="text-xs px-2 py-1 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50"
                                                    >
                                                        +{item.tags.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Botón de acción mejorado */}
                                        <Button 
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            {item.isCompleted ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Completado
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4 mr-2" />
                                                    {item.isPremium ? 'Acceder Premium' : 'Comenzar'}
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Estado vacío mejorado */}
                    {filteredContent.length === 0 && (
                        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
                            <CardContent className="text-center py-16">
                                <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
                                    <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full">
                                        <BookOpen className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                                            {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all'
                                                ? 'No se encontró contenido con los filtros aplicados'
                                                : 'No hay contenido disponible'
                                            }
                                        </h3>
                                        <p className="text-sm">
                                            Intenta ajustar los filtros o buscar con otros términos
                                        </p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="mt-4 border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCategoryFilter('all');
                                            setDifficultyFilter('all');
                                            setShowCompleted(false);
                                            setShowBookmarked(false);
                                        }}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Limpiar Filtros
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};