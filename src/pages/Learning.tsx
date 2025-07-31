import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    BookOpen, Search, Filter, Play, Clock, Star, Users, Award, 
    TrendingUp, Target, Shield, DollarSign, GraduationCap, 
    Video, FileText, Headphones, CheckCircle, Lock, Unlock,
    ChevronRight, Calendar, Bookmark, Share2, Download
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

        return {
            total,
            completed,
            bookmarked,
            inProgress,
            totalHours: Math.round(totalHours * 10) / 10
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
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
            {/* Header mejorado */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/50 dark:to-blue-900/50">
                                <BookOpen className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Centro de Aprendizaje
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Mejora tus habilidades y conocimientos en el mundo de los seguros
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Acciones principales */}
                    <div className="flex flex-wrap gap-3">
                        <Button 
                            variant="outline"
                            className="border-green-300 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                        >
                            <Bookmark className="h-4 w-4 mr-2" />
                            Mis Favoritos
                        </Button>
                        <Button 
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Award className="h-4 w-4" />
                            Mis Certificaciones
                        </Button>
                    </div>
                </div>
            </div>

            {/* Estadísticas del usuario */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Cursos</p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{userStats.total}</p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">Completados</p>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{userStats.completed}</p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    {userStats.total > 0 ? `${((userStats.completed / userStats.total) * 100).toFixed(1)}%` : '0%'} del total
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">En Progreso</p>
                                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{userStats.inProgress}</p>
                                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                    Cursos activos
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Favoritos</p>
                                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{userStats.bookmarked}</p>
                                <p className="text-xs text-purple-600 dark:text-purple-400">
                                    Guardados
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
                                <Bookmark className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Horas Totales</p>
                                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{userStats.totalHours}h</p>
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                    Contenido disponible
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50">
                                <Target className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros y Búsqueda */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                            <Search className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-gray-900 dark:text-white">Buscar y Filtrar Contenido</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Búsqueda principal */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Search className="h-5 w-5" />
                        </div>
                        <Input
                            placeholder="Buscar por título, descripción o etiquetas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-12 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-400 dark:focus:border-green-400"
                        />
                    </div>

                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Categoría</label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="border-gray-300 dark:border-gray-600">
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

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Dificultad</label>
                            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                                <SelectTrigger className="border-gray-300 dark:border-gray-600">
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

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="showCompleted"
                                checked={showCompleted}
                                onChange={(e) => setShowCompleted(e.target.checked)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <label htmlFor="showCompleted" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Solo completados
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="showBookmarked"
                                checked={showBookmarked}
                                onChange={(e) => setShowBookmarked(e.target.checked)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <label htmlFor="showBookmarked" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Solo favoritos
                            </label>
                        </div>
                    </div>

                    {/* Resumen de resultados */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <BookOpen className="w-4 h-4" />
                                <span className="font-medium">
                                    Mostrando {filteredContent.length} de {dummyLearningContent.length} recursos
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Grid de contenido */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredContent.map((item) => {
                    const CategoryIcon = getCategoryIcon(item.category);
                    return (
                        <Card 
                            key={item.id} 
                            className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
                        >
                            {/* Header de la card */}
                            <div className="relative">
                                <div className="h-32 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center">
                                    <CategoryIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
                                </div>
                                
                                {/* Badges superpuestos */}
                                <div className="absolute top-2 left-2 flex gap-1">
                                    <Badge className={getDifficultyColor(item.difficulty)}>
                                        {item.difficulty}
                                    </Badge>
                                    {item.isPremium && (
                                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                            <Star className="w-3 h-3 mr-1" />
                                            Premium
                                        </Badge>
                                    )}
                                </div>

                                {/* Botones de acción */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800"
                                    >
                                        <Bookmark className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Indicador de completado */}
                                {item.isCompleted && (
                                    <div className="absolute bottom-2 right-2">
                                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Contenido de la card */}
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Metadatos */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {item.rating}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {item.instructor}
                                            </span>
                                        </div>

                                        {/* Etiquetas */}
                                        <div className="flex flex-wrap gap-1">
                                            {item.tags.slice(0, 2).map((tag, index) => (
                                                <Badge 
                                                    key={index} 
                                                    variant="outline" 
                                                    className="text-xs px-2 py-1 border-gray-200 dark:border-gray-600"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {item.tags.length > 2 && (
                                                <Badge 
                                                    variant="outline" 
                                                    className="text-xs px-2 py-1 border-gray-200 dark:border-gray-600"
                                                >
                                                    +{item.tags.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botón de acción */}
                                    <Button 
                                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transition-all duration-200"
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
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Estado vacío */}
            {filteredContent.length === 0 && (
                <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                        <div className="text-lg font-medium">
                            {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all'
                                ? 'No se encontró contenido con los filtros aplicados'
                                : 'No hay contenido disponible'
                            }
                        </div>
                        <p className="text-sm">
                            Intenta ajustar los filtros o buscar con otros términos
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};