import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Settings, Shield, Bell, Palette, Database, 
    Save, RefreshCw, AlertTriangle, CheckCircle, Info,
    Lock, Eye, Globe, Mail, Clock, Zap
} from 'lucide-react';
import { SystemSettings as SystemSettingsType, dummySystemSettings } from '@/data/admin';

interface SystemSettingsProps {
    currentUser: any;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ currentUser }) => {
    const [settings, setSettings] = useState<SystemSettingsType[]>(dummySystemSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Agrupar configuraciones por categoría
    const groupedSettings = settings.reduce((acc, setting) => {
        if (!acc[setting.category]) {
            acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
    }, {} as Record<string, SystemSettingsType[]>);

    // Obtener icono y color para la categoría
    const getCategoryInfo = (category: string) => {
        switch (category) {
            case 'security':
                return { icon: Shield, color: 'text-red-600', bgColor: 'bg-red-50', title: 'Seguridad' };
            case 'general':
                return { icon: Settings, color: 'text-blue-600', bgColor: 'bg-blue-50', title: 'General' };
            case 'notifications':
                return { icon: Bell, color: 'text-green-600', bgColor: 'bg-green-50', title: 'Notificaciones' };
            case 'appearance':
                return { icon: Palette, color: 'text-purple-600', bgColor: 'bg-purple-50', title: 'Apariencia' };
            default:
                return { icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-50', title: 'Otros' };
        }
    };

    // Actualizar configuración
    const handleSettingChange = (settingId: string, newValue: any) => {
        setSettings(prev => prev.map(setting => 
            setting.id === settingId 
                ? { ...setting, value: newValue, updatedAt: new Date().toISOString() }
                : setting
        ));
        setHasChanges(true);
    };

    // Guardar cambios
    const handleSaveChanges = async () => {
        setIsSaving(true);
        // Simular guardado
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHasChanges(false);
        setIsSaving(false);
    };

    // Restablecer configuración
    const handleResetSetting = (settingId: string) => {
        const originalSetting = dummySystemSettings.find(s => s.id === settingId);
        if (originalSetting) {
            setSettings(prev => prev.map(setting => 
                setting.id === settingId 
                    ? { ...setting, value: originalSetting.value, updatedAt: new Date().toISOString() }
                    : setting
            ));
            setHasChanges(true);
        }
    };

    // Renderizar campo de configuración
    const renderSettingField = (setting: SystemSettingsType) => {
        const { icon: CategoryIcon, color } = getCategoryInfo(setting.category);

        return (
            <div key={setting.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-full ${getCategoryInfo(setting.category).bgColor} dark:bg-slate-700`}>
                        <CategoryIcon className={`w-4 h-4 ${color}`} />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-900 dark:text-white">
                                {setting.description}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                                {setting.key}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Última actualización: {new Date(setting.updatedAt).toLocaleString('es-ES')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Campo de valor */}
                    <div className="flex items-center gap-2">
                        {typeof setting.value === 'boolean' ? (
                            <Switch
                                checked={setting.value}
                                onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                                className="data-[state=checked]:bg-blue-600"
                            />
                        ) : typeof setting.value === 'number' ? (
                            <Input
                                type="number"
                                value={setting.value}
                                onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
                                className="w-24"
                            />
                        ) : setting.key === 'theme' ? (
                            <Select value={setting.value} onValueChange={(value) => handleSettingChange(setting.id, value)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Claro</SelectItem>
                                    <SelectItem value="dark">Oscuro</SelectItem>
                                    <SelectItem value="auto">Automático</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                value={setting.value}
                                onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                                className="w-48"
                            />
                        )}
                    </div>

                    {/* Botón de restablecer */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetSetting(setting.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header con estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0">
                    <CardContent className="p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Configuraciones</p>
                                <p className="text-3xl font-bold">{settings.length}</p>
                            </div>
                            <Settings className="w-8 h-8 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0">
                    <CardContent className="p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm">Seguridad</p>
                                <p className="text-3xl font-bold">
                                    {settings.filter(s => s.category === 'security').length}
                                </p>
                            </div>
                            <Shield className="w-8 h-8 text-red-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0">
                    <CardContent className="p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Notificaciones</p>
                                <p className="text-3xl font-bold">
                                    {settings.filter(s => s.category === 'notifications').length}
                                </p>
                            </div>
                            <Bell className="w-8 h-8 text-green-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0">
                    <CardContent className="p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Apariencia</p>
                                <p className="text-3xl font-bold">
                                    {settings.filter(s => s.category === 'appearance').length}
                                </p>
                            </div>
                            <Palette className="w-8 h-8 text-purple-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Panel de control */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <CardTitle className="flex items-center justify-between text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                                <Settings className="h-5 w-5 text-white" />
                            </div>
                            <span>Configuración del Sistema</span>
                        </div>
                        <div className="flex gap-2">
                            {hasChanges && (
                                <Badge variant="outline" className="border-orange-300 text-orange-600">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Cambios pendientes
                                </Badge>
                            )}
                            <Button
                                onClick={handleSaveChanges}
                                disabled={!hasChanges || isSaving}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    {/* Configuraciones por categoría */}
                    {Object.entries(groupedSettings).map(([category, categorySettings]) => {
                        const { icon: CategoryIcon, color, bgColor, title } = getCategoryInfo(category);
                        
                        return (
                            <div key={category} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${bgColor} dark:bg-slate-700`}>
                                        <CategoryIcon className={`w-5 h-5 ${color}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {title}
                                    </h3>
                                    <Badge variant="outline" className="text-xs">
                                        {categorySettings.length} configuraciones
                                    </Badge>
                                </div>
                                
                                <div className="space-y-3">
                                    {categorySettings.map(renderSettingField)}
                                </div>
                            </div>
                        );
                    })}

                    {/* Información adicional */}
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="space-y-2">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                                    Información sobre las configuraciones
                                </h4>
                                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                    <li>• <strong>Seguridad:</strong> Configuraciones relacionadas con la seguridad del sistema</li>
                                    <li>• <strong>General:</strong> Configuraciones básicas del sistema</li>
                                    <li>• <strong>Notificaciones:</strong> Configuraciones de alertas y notificaciones</li>
                                    <li>• <strong>Apariencia:</strong> Configuraciones visuales y de tema</li>
                                </ul>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Los cambios se aplicarán inmediatamente después de guardar.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
