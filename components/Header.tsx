import React, { useRef } from 'react';
import { Shift, View } from '../types.ts';
import { SunIcon, MoonIcon, CogIcon, ChartBarIcon, CalendarIcon, UploadIcon, DownloadIcon, DuplicateIcon, TableIcon, PrinterIcon } from './icons.tsx';

interface HeaderProps {
  year: number;
  setYear: (year: number) => void;
  view: View;
  setView: (view: View) => void;
  onSettings: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPrint: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  shifts: Shift[];
  filter: string | null;
  setFilter: (filter: string | null) => void;
  onDuplicateYear: () => void;
}

export const Header: React.FC<HeaderProps> = ({ year, setYear, view, setView, onSettings, onExport, onImport, onPrint, theme, toggleTheme, shifts, filter, setFilter, onDuplicateYear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md p-2 sm:p-4 print:hidden">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">Cuadrante Turnos</h1>
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button onClick={() => setYear(year - 1)} className="px-2 py-1 text-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition-colors">-</button>
            <span className="px-3 py-1 text-lg font-semibold w-24 text-center">{year}</span>
            <button onClick={() => setYear(year + 1)} className="px-2 py-1 text-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg transition-colors">+</button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
            <select
                value={filter || ''}
                onChange={(e) => setFilter(e.target.value || null)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrar por turno"
            >
                <option value="">Todos los turnos</option>
                {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 <option value="holiday">Festivos</option>
            </select>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setView('calendar')} className={`p-2 rounded-md ${view === 'calendar' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Vista Calendario"><CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            <button onClick={() => setView('stats')} className={`p-2 rounded-md ${view === 'stats' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Estadísticas"><ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            <button onClick={() => setView('full_year')} className={`p-2 rounded-md ${view === 'full_year' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Vista Anual Completa"><TableIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
            {view === 'full_year' && (
              <button onClick={onPrint} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" title="Imprimir"><PrinterIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            )}
            <button onClick={onSettings} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" title="Configuración"><CogIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            <button onClick={onDuplicateYear} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" title="Duplicar año anterior"><DuplicateIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" title="Importar JSON"><UploadIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            <input type="file" ref={fileInputRef} onChange={onImport} className="hidden" accept=".json" />
            <button onClick={onExport} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" title="Exportar JSON"><DownloadIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" title="Cambiar tema">
              {theme === 'light' ? <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <SunIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
        </div>
      </div>
    </header>
  );
};