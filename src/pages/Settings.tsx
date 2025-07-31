import React, { useState, useEffect } from 'react';
import { 
    User, Lock, Mail, Bell, Shield, Palette, Globe, Key, 
    Eye, EyeOff, Save, Edit, Camera, Trash, Download, 
    Smartphone, Monitor, Moon, Sun, Settings as SettingsIcon,
    CheckCircle, AlertCircle, Info, ChevronRight, LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/supabaseClient';
import clsx from 'clsx';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    avatar_url?: string;
    role: 'admin' | 'agent' | 'manager';
    created_at: string;
    last_sign_in: string;
    preferences: {
        theme: 'light' | 'dark' | 'auto';
        language: 'es' | 'en';
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
        privacy: {
            profile_visible: boolean;
            activity_visible: boolean;
        };
    };
}

export default function Settings() {
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Estados del formulario
    const [profile, setProfile] = useState<UserProfile>({
        id: '',
        email: '',
        full_name: '',
        phone: '',
        avatar_url: '',
        role: 'agent',
        created_at: '',
        last_sign_in: '',
        preferences: {
            theme: 'auto',
            language: 'es',
            notifications: {
                email: true,
                push: true,
                sms: false,
            },
            privacy: {
                profile_visible: true,
                activity_visible: false,
            },
        },
    });

    // Estados para cambio de contraseña
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Estados para configuración de seguridad
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorEnabled: false,
        sessionTimeout: 30,
        loginNotifications: true,
        suspiciousActivityAlerts: true,
    });

    // Cargar datos del usuario
    useEffect(() => {
        if (user) {
            loadUserProfile();
        }
    }, [user]);

    const loadUserProfile = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setProfile({
                    id: data.id,
                    email: data.email || user.email || '',
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    avatar_url: data.avatar_url || '',
                    role: data.role || 'agent',
                    created_at: data.created_at || '',
                    last_sign_in: data.last_sign_in || '',
                    preferences: data.preferences || {
                        theme: 'auto',
                        language: 'es',
                        notifications: {
                            email: true,
                            push: true,
                            sms: false,
                        },
                        privacy: {
                            profile_visible: true,
                            activity_visible: false,
                        },
                    },
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setMessage({ type: 'error', text: 'Error al cargar el perfil' });
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: profile.email,
                    full_name: profile.full_name,
                    phone: profile.phone,
                    avatar_url: profile.avatar_url,
                    role: profile.role,
                    preferences: profile.preferences,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async () => {
        if (!user) return;

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' });
            return;
        }

        try {
            setIsLoading(true);
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword,
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage({ type: 'error', text: 'Error al cambiar la contraseña' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User, color: 'text-blue-600' },
        { id: 'security', label: 'Seguridad', icon: Shield, color: 'text-red-600' },
        { id: 'notifications', label: 'Notificaciones', icon: Bell, color: 'text-green-600' },
        { id: 'preferences', label: 'Preferencias', icon: SettingsIcon, color: 'text-purple-600' },
        { id: 'privacy', label: 'Privacidad', icon: Lock, color: 'text-orange-600' },
    ];

    const getTabIcon = (tabId: string) => {
        const tab = tabs.find(t => t.id === tabId);
        return tab ? tab.icon : User;
    };

    const getTabColor = (tabId: string) => {
        const tab = tabs.find(t => t.id === tabId);
        return tab ? tab.color : 'text-gray-600';
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50">
                                <SettingsIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Configuración de Cuenta
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Gestiona tu perfil, seguridad y preferencias
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Acciones principales */}
                    <div className="flex flex-wrap gap-3">
                        <Button 
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Cerrar Sesión
                        </Button>
                        <Button 
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            onClick={updateProfile}
                            disabled={isLoading}
                        >
                            <Save className="h-4 w-4" />
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mensaje de estado */}
            {message && (
                <div className={clsx(
                    "p-4 rounded-lg border flex items-center gap-3",
                    message.type === 'success' && "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
                    message.type === 'error' && "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
                    message.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
                )}>
                    {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
                    {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
                    {message.type === 'info' && <Info className="w-5 h-5" />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navegación lateral */}
                <aside className="lg:w-1/4">
                    <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                Configuración
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <nav className="flex flex-col gap-2">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={clsx(
                                                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                                                activeTab === tab.id
                                                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 shadow-md'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                            )}
                                        >
                                            <Icon className={clsx("w-5 h-5", activeTab === tab.id ? tab.color : "text-gray-500 dark:text-gray-400")} />
                                            <span>{tab.label}</span>
                                            <ChevronRight className="w-4 h-4 ml-auto" />
                                        </button>
                                    );
                                })}
                            </nav>
                        </CardContent>
                    </Card>
                </aside>

                {/* Contenido principal */}
                <main className="flex-grow lg:w-3/4">
                    <Card className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                {(() => {
                                    const Icon = getTabIcon(activeTab);
                                    return <Icon className="w-5 h-5" />;
                                })()}
                                {tabs.find(t => t.id === activeTab)?.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    {/* Información del perfil */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Nombre Completo
                                                </Label>
                                                <Input
                                                    id="fullName"
                                                    value={profile.full_name}
                                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                                    placeholder="Tu nombre completo"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Correo Electrónico
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                    placeholder="tu@email.com"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Teléfono
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    value={profile.phone}
                                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                    placeholder="+52 55 1234 5678"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Rol de Usuario
                                                </Label>
                                                <div className="mt-1">
                                                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {profile.role === 'admin' ? 'Administrador' : 
                                                         profile.role === 'manager' ? 'Gerente' : 'Agente'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Miembro desde
                                                </Label>
                                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString('es-MX') : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Último acceso
                                                </Label>
                                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                    {profile.last_sign_in ? new Date(profile.last_sign_in).toLocaleDateString('es-MX') : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    {/* Cambio de contraseña */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Lock className="w-5 h-5 text-red-600" />
                                            Cambiar Contraseña
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Contraseña Actual
                                                </Label>
                                                <div className="relative mt-1">
                                                    <Input
                                                        id="currentPassword"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        placeholder="Contraseña actual"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Nueva Contraseña
                                                </Label>
                                                <div className="relative mt-1">
                                                    <Input
                                                        id="newPassword"
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        placeholder="Nueva contraseña"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Confirmar Nueva Contraseña
                                            </Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="confirmPassword"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    placeholder="Confirmar nueva contraseña"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={changePassword}
                                            disabled={isLoading}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            <Key className="w-4 h-4 mr-2" />
                                            Cambiar Contraseña
                                        </Button>
                                    </div>

                                    {/* Configuración de seguridad */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-orange-600" />
                                            Configuración de Seguridad
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">Autenticación de dos factores</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Añade una capa extra de seguridad a tu cuenta
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={securitySettings.twoFactorEnabled}
                                                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">Notificaciones de inicio de sesión</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Recibe alertas cuando inicies sesión desde un nuevo dispositivo
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={securitySettings.loginNotifications}
                                                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginNotifications: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">Alertas de actividad sospechosa</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Notificaciones sobre actividades inusuales en tu cuenta
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={securitySettings.suspiciousActivityAlerts}
                                                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, suspiciousActivityAlerts: checked })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-green-600" />
                                        Configuración de Notificaciones
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">Notificaciones por correo</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Recibe actualizaciones importantes por email
                                                </p>
                                            </div>
                                            <Switch
                                                checked={profile.preferences.notifications.email}
                                                onCheckedChange={(checked) => setProfile({
                                                    ...profile,
                                                    preferences: {
                                                        ...profile.preferences,
                                                        notifications: {
                                                            ...profile.preferences.notifications,
                                                            email: checked
                                                        }
                                                    }
                                                })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">Notificaciones push</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Alertas en tiempo real en tu navegador
                                                </p>
                                            </div>
                                            <Switch
                                                checked={profile.preferences.notifications.push}
                                                onCheckedChange={(checked) => setProfile({
                                                    ...profile,
                                                    preferences: {
                                                        ...profile.preferences,
                                                        notifications: {
                                                            ...profile.preferences.notifications,
                                                            push: checked
                                                        }
                                                    }
                                                })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">Notificaciones SMS</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Mensajes de texto para alertas críticas
                                                </p>
                                            </div>
                                            <Switch
                                                checked={profile.preferences.notifications.sms}
                                                onCheckedChange={(checked) => setProfile({
                                                    ...profile,
                                                    preferences: {
                                                        ...profile.preferences,
                                                        notifications: {
                                                            ...profile.preferences.notifications,
                                                            sms: checked
                                                        }
                                                    }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'preferences' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <SettingsIcon className="w-5 h-5 text-purple-600" />
                                        Preferencias Generales
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="theme" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Tema de la aplicación
                                                </Label>
                                                <Select
                                                    value={profile.preferences.theme}
                                                    onValueChange={(value: 'light' | 'dark' | 'auto') => setProfile({
                                                        ...profile,
                                                        preferences: {
                                                            ...profile.preferences,
                                                            theme: value
                                                        }
                                                    })}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="light">Claro</SelectItem>
                                                        <SelectItem value="dark">Oscuro</SelectItem>
                                                        <SelectItem value="auto">Automático</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="language" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Idioma
                                                </Label>
                                                <Select
                                                    value={profile.preferences.language}
                                                    onValueChange={(value: 'es' | 'en') => setProfile({
                                                        ...profile,
                                                        preferences: {
                                                            ...profile.preferences,
                                                            language: value
                                                        }
                                                    })}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="es">Español</SelectItem>
                                                        <SelectItem value="en">English</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="sessionTimeout" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Tiempo de sesión (minutos)
                                                </Label>
                                                <Select
                                                    value={securitySettings.sessionTimeout.toString()}
                                                    onValueChange={(value) => setSecuritySettings({
                                                        ...securitySettings,
                                                        sessionTimeout: parseInt(value)
                                                    })}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="15">15 minutos</SelectItem>
                                                        <SelectItem value="30">30 minutos</SelectItem>
                                                        <SelectItem value="60">1 hora</SelectItem>
                                                        <SelectItem value="120">2 horas</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'privacy' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-orange-600" />
                                        Configuración de Privacidad
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">Perfil visible</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Permite que otros usuarios vean tu información de perfil
                                                </p>
                                            </div>
                                            <Switch
                                                checked={profile.preferences.privacy.profile_visible}
                                                onCheckedChange={(checked) => setProfile({
                                                    ...profile,
                                                    preferences: {
                                                        ...profile.preferences,
                                                        privacy: {
                                                            ...profile.preferences.privacy,
                                                            profile_visible: checked
                                                        }
                                                    }
                                                })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">Actividad visible</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Muestra tu actividad reciente a otros usuarios
                                                </p>
                                            </div>
                                            <Switch
                                                checked={profile.preferences.privacy.activity_visible}
                                                onCheckedChange={(checked) => setProfile({
                                                    ...profile,
                                                    preferences: {
                                                        ...profile.preferences,
                                                        privacy: {
                                                            ...profile.preferences.privacy,
                                                            activity_visible: checked
                                                        }
                                                    }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Acciones de privacidad */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Acciones de Privacidad</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                                                <Download className="w-4 h-4 mr-2" />
                                                Exportar mis datos
                                            </Button>
                                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                                                <Trash className="w-4 h-4 mr-2" />
                                                Eliminar cuenta
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
} 