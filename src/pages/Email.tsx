import React from 'react';
import { Inbox, Send, FileText, Calendar, Users, Archive, Trash2, Star, Plus, Search } from 'lucide-react';
import clsx from 'clsx';

// Datos de ejemplo (reemplazar con datos reales)
const exampleEmails = [
  { id: 1, sender: 'Ana López', subject: 'Re: Cotización Seguro de Auto - Sr. García', snippet: 'Adjunto la cotización actualizada como solicitó...', time: '09:15 AM', read: false, starred: true },
  { id: 2, sender: 'Notificaciones Qualitas', subject: 'Póliza QA-987654 - Fin de Vigencia en 30 días', snippet: 'Estimado Agente, le informamos que la póliza de auto...', time: 'Ayer', read: false, starred: false },
  { id: 3, sender: 'Carlos Marín', subject: 'Documentos pendientes Sra. Hernández (GMM)', snippet: 'Alex, ¿recibiste ya la solicitud firmada? Urge...', time: 'Ayer', read: true, starred: false },
  { id: 4, sender: 'Prospecto: Laura Fuentes', subject: 'Información Seguro de Vida', snippet: 'Hola, vi su anuncio en Facebook y me gustaría saber más...', time: 'Vie', read: false, starred: true },
  { id: 5, sender: 'Soporte Consolida CRM', subject: 'Recordatorio: Capacitación Nuevas Funcionalidades', snippet: 'No olvide unirse a nuestra sesión de hoy a las 4 PM...', time: 'Vie', read: true, starred: false },
  { id: 6, sender: 'Juan Torres (Cliente)', subject: 'Duda sobre cobertura de mi póliza de hogar', snippet: 'Estimado asesor, tengo una pregunta sobre...', time: 'Jue', read: true, starred: false },
];

const folders = [
  { name: 'Bandeja de entrada', icon: Inbox, count: 3, current: true },
  { name: 'Enviados', icon: Send, count: 0, current: false },
  { name: 'Borradores', icon: FileText, count: 1, current: false },
  { name: 'Archivados', icon: Archive, count: 25, current: false },
  { name: 'Papelera', icon: Trash2, count: 5, current: false },
  { name: 'Favoritos', icon: Star, count: 2, current: false },
];

const tools = [
  { name: 'Calendario', icon: Calendar, current: false },
  { name: 'Contactos', icon: Users, current: false },
];

export const Email: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-var(--header-height,4rem))] bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* --- Barra Lateral de Correo --- */}
      <aside className="w-64 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="p-4">
          <button className="flex items-center justify-center w-full px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md shadow hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Redactar
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto" aria-label="Carpetas">
          {folders.map((folder) => (
            <a
              key={folder.name}
              href="#"
              className={clsx(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                folder.current
                  ? 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              <folder.icon className="w-5 h-5 mr-3 flex-shrink-0" aria-hidden="true" />
              <span className="flex-1">{folder.name}</span>
              {folder.count > 0 && (
                <span className={clsx(
                  'ml-auto inline-block py-0.5 px-2 text-xs rounded-full',
                  folder.current
                    ? 'bg-primary text-white dark:bg-primary-dark dark:text-gray-900'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                 )}>
                  {folder.count}
                </span>
              )}
            </a>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 dark:text-gray-400" id="tools-headline">
            Herramientas
          </h3>
          <div className="space-y-1" role="group" aria-labelledby="tools-headline">
            {tools.map((tool) => (
              <a
                key={tool.name}
                href="#" // Cambiar a rutas reales luego
                className={clsx(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  tool.current
                    ? 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                <tool.icon className="w-5 h-5 mr-3 flex-shrink-0" aria-hidden="true" />
                {tool.name}
              </a>
            ))}
          </div>
        </div>
      </aside>

      {/* --- Lista de Correos --- */}
      <section className="w-96 flex flex-col bg-gray-50 dark:bg-gray-850 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        {/* Cabecera Lista */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Bandeja de entrada</h2>
          <div className="relative">
            <input
              type="search"
              placeholder="Buscar en correo..."
              className="pl-8 pr-2 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-primary focus:border-primary dark:focus:ring-primary-dark dark:focus:border-primary-dark"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        {/* Lista Scrollable */}
        <ul className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
          {exampleEmails.map((email) => (
            <li key={email.id} className={clsx(
                "p-3 hover:bg-gray-100 dark:hover:bg-gray-750 cursor-pointer",
                !email.read && "bg-white dark:bg-gray-800 font-semibold"
             )}>
              <div className="flex justify-between items-center mb-1">
                <p className={clsx("text-sm truncate", !email.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>{email.sender}</p>
                <time className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{email.time}</time>
              </div>
              <p className={clsx("text-sm truncate", !email.read ? "text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-400")}>{email.subject}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{email.snippet}</p>
              {email.starred && <Star className="w-3 h-3 text-yellow-400 inline-block ml-1 relative -top-px" fill="currentColor" />}
            </li>
          ))}
        </ul>
      </section>

      {/* --- Panel de Lectura --- */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-gray-850">
        {/* Placeholder Panel Lectura - Más detallado */}
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
             <Inbox className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" strokeWidth={1} />
            <p className="mt-2 text-lg font-medium">Bandeja de entrada vacía o correo no seleccionado</p>
            <p className="mt-1 text-sm">Selecciona un correo de la lista de la izquierda para verlo aquí.</p>
            {/* Ejemplo de cómo se vería un correo seleccionado (simplificado) */}
            {/* 
            <div className="text-left mt-8 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="border-b pb-2 mb-2 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Re: Cotización Seguro de Auto - Sr. García</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">De: Ana López &lt;ana.lopez@consolida.com&gt;</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Para: Tu Correo &lt;tu@consolida.com&gt;</p>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                Hola Alex,
                <br/><br/>
                Adjunto la cotización actualizada como solicitó el Sr. García, incluyendo la cobertura amplia.
                <br/><br/>
                Saludos,
                <br/>Ana
              </p>
            </div>
            */}
          </div>
        </div>
        {/* Aquí iría el contenido REAL del correo seleccionado */}
      </main>
    </div>
  );
}; 