import React, { useState, useEffect, useMemo, useCallback, useRef, Dispatch, SetStateAction } from 'react';
import ReactDOM from 'react-dom/client';

// =============================================
// Contenido de: types.ts
// =============================================
interface Shift {
  id: string;
  name: string;
  color: string;
  startTime: string;
  endTime: string;
}

interface DayData {
  shiftId: string | null;
}

interface Rotation {
  name: string;
  sequence: string[];
  startDate: string;
}

type View = 'calendar' | 'stats' | 'full_year';


// =============================================
// Contenido de: constants.ts
// =============================================
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEK_DAY_NAMES = ["D", "L", "M", "X", "J", "V", "S"];
const WEEK_DAY_NAMES_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', 
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];


// =============================================
// Contenido de: services/holidays.ts
// =============================================
const getSpanishHolidays = (year: number): Record<string, string> => {
  const easterDate = getEaster(year);
  const holidays: Record<string, Date> = {
    "Año Nuevo": new Date(Date.UTC(year, 0, 1)),
    "Epifanía del Señor": new Date(Date.UTC(year, 0, 6)),
    "Viernes Santo": new Date(Date.UTC(year, easterDate.getUTCMonth(), easterDate.getUTCDate() - 2)),
    "Fiesta del Trabajo": new Date(Date.UTC(year, 4, 1)),
    "Asunción de la Virgen": new Date(Date.UTC(year, 7, 15)),
    "Fiesta Nacional de España": new Date(Date.UTC(year, 9, 12)),
    "Día de todos los Santos": new Date(Date.UTC(year, 10, 1)),
    "Día de la Constitución Española": new Date(Date.UTC(year, 11, 6)),
    "Inmaculada Concepción": new Date(Date.UTC(year, 11, 8)),
    "Navidad": new Date(Date.UTC(year, 11, 25)),
  };
    // Jueves Santo can be regional
    holidays["Jueves Santo"] = new Date(Date.UTC(year, easterDate.getUTCMonth(), easterDate.getUTCDate() - 3));


  const holidayMap: Record<string, string> = {};
  for (const name in holidays) {
    const date = holidays[name];
    if (date.getUTCFullYear() === year) {
        const dateString = date.toISOString().split('T')[0];
        holidayMap[dateString] = name;
    }
  }
  return holidayMap;
};

// Computus algorithm to find Easter Sunday
function getEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}


// =============================================
// Contenido de: hooks/useLocalStorage.ts
// =============================================
function useLocalStorage<T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
        } catch(e) {
            console.log(e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]);

  return [storedValue, setValue];
}


// =============================================
// Contenido de: components/icons.tsx
// =============================================
interface IconProps {
  className?: string;
}

const SunIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const CogIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChartBarIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const CalendarIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const UploadIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const DownloadIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const DuplicateIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const TableIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
    </svg>
);

const PrinterIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2h2m8 0v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0H9m6-4V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4m6 0h.01" />
    </svg>
);


// =============================================
// Contenido de: components/Header.tsx
// =============================================
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

const Header: React.FC<HeaderProps> = ({ year, setYear, view, setView, onSettings, onExport, onImport, onPrint, theme, toggleTheme, shifts, filter, setFilter, onDuplicateYear }) => {
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


// =============================================
// Contenido de: components/Calendar.tsx
// =============================================
interface CalendarProps {
  year: number;
  calendarData: Record<string, DayData>;
  shifts: Shift[];
  holidays: Record<string, string>;
  onDayClick: (date: Date) => void;
  filter: string | null;
}

const DayCell: React.FC<{
  date: Date;
  data: DayData;
  holiday?: string;
  shift?: Shift;
  onClick: () => void;
  isFilteredOut: boolean;
}> = ({ date, data, holiday, shift, onClick, isFilteredOut }) => {
  const dayOfMonth = date.getUTCDate();
  const dayOfWeek = date.getUTCDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Base background
  let cellBgColor = 'bg-white dark:bg-gray-800';
  if (isWeekend) {
    cellBgColor = 'bg-gray-50 dark:bg-gray-800/50';
  }
  
  // Base text color for day number and day-of-week indicator
  let dayNumberTextColor = 'text-gray-700 dark:text-gray-300';
  if (holiday) {
    dayNumberTextColor = 'text-red-600 dark:text-red-400 font-bold';
  }

  // Shift background overrides base background
  const shiftStyle = shift ? { backgroundColor: `${shift.color}40`, border: `1px solid ${shift.color}` } : {};

  // If there's no shift but it's a holiday, apply special holiday background
  if (!shift && holiday) {
    cellBgColor = 'bg-red-100 dark:bg-red-900/50';
  }
  
  return (
    <div
      className={`relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-md cursor-pointer transition-transform transform hover:scale-105 ${cellBgColor} ${isFilteredOut ? 'opacity-20' : ''}`}
      style={shiftStyle}
      onClick={onClick}
      title={holiday ? `${holiday}${shift ? ` - ${shift.name}` : ''}` : shift?.name || ''}
    >
      <span className={`absolute top-0.5 right-1 text-xs ${dayNumberTextColor} opacity-70`}>{WEEK_DAY_NAMES[dayOfWeek]}</span>
      
      {data.shiftId && shift ? (
        <>
          <span className={`absolute top-0.5 left-1.5 text-sm font-medium ${dayNumberTextColor}`}>{dayOfMonth}</span>
          <span
            className={`text-xl font-bold ${holiday ? 'text-red-600 dark:text-red-400' : ''}`}
            style={holiday ? {} : { color: shift.color }}
          >
            {shift.id}
          </span>
        </>
      ) : (
        <span className={`text-lg font-medium ${dayNumberTextColor}`}>{holiday ? 'F' : dayOfMonth}</span>
      )}
    </div>
  );
};

const MonthGrid: React.FC<{
  year: number;
  month: number;
  calendarData: Record<string, DayData>;
  shifts: Shift[];
  holidays: Record<string, string>;
  onDayClick: (date: Date) => void;
  filter: string | null;
}> = ({ year, month, calendarData, shifts, holidays, onDayClick, filter }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const shiftMap = new Map(shifts.map(s => [s.id, s]));

  const renderDays = () => {
    const days = [];
    // Add blank days for the first week
    for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
      days.push(<div key={`blank-${i}`} className="w-10 h-10 sm:w-12 sm:h-12" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month, day));
      const dateString = date.toISOString().split('T')[0];
      const data = calendarData[dateString] || { shiftId: null };
      const holiday = holidays[dateString];
      const shift = data.shiftId ? shiftMap.get(data.shiftId) : undefined;
      
      let isFilteredOut = false;
      if (filter) {
        if (filter === 'holiday') {
            isFilteredOut = !holiday;
        } else {
            isFilteredOut = data.shiftId !== filter;
        }
      }

      days.push(
        <DayCell
          key={day}
          date={date}
          data={data}
          holiday={holiday}
          shift={shift}
          onClick={() => onDayClick(date)}
          isFilteredOut={isFilteredOut}
        />
      );
    }
    return days;
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-lg animate-fadeIn">
      <h3 className="text-xl font-bold text-center mb-4 text-blue-600 dark:text-blue-400">{MONTH_NAMES[month]} {year}</h3>
      <div className="grid grid-cols-7 gap-1.5 justify-items-center">
        {WEEK_DAY_NAMES.slice(1).concat(WEEK_DAY_NAMES[0]).map(day => (
          <div key={day} className="w-10 sm:w-12 text-center font-bold text-gray-500 dark:text-gray-400 text-sm">{day}</div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};

const Calendar: React.FC<CalendarProps> = (props) => {
  return (
    <div className="space-y-6">
      {MONTH_NAMES.map((_, index) => (
        <MonthGrid key={index} month={index} {...props} />
      ))}
    </div>
  );
};


// =============================================
// Contenido de: components/StatsView.tsx
// =============================================
interface StatsViewProps {
  year: number;
  calendarData: Record<string, DayData>;
  shifts: Shift[];
  targetAnnualHours: number;
  setTargetAnnualHours: (hours: number) => void;
}

const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`1970-01-01T${startTime}:00`);
    let end = new Date(`1970-01-01T${endTime}:00`);
    if (end < start) {
        end = new Date(`1970-01-02T${endTime}:00`);
    }
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

const StatsView: React.FC<StatsViewProps> = ({ year, calendarData, shifts, targetAnnualHours, setTargetAnnualHours }) => {

  const stats = useMemo(() => {
    const monthlyStats: { [month: number]: { shiftCounts: Record<string, number>, totalHours: number } } = {};
    const shiftMap: Map<string, Shift> = new Map(shifts.map(s => [s.id, s]));

    for (let i = 0; i < 12; i++) {
        monthlyStats[i] = { shiftCounts: {}, totalHours: 0 };
        shifts.forEach(s => monthlyStats[i].shiftCounts[s.id] = 0);
    }
    
    for (const dateString in calendarData) {
      if (Object.prototype.hasOwnProperty.call(calendarData, dateString)) {
        const data = calendarData[dateString];
        const date = new Date(dateString);
        if (date.getFullYear() !== year) continue;

        const month = date.getMonth();
        if (data.shiftId) {
          if (monthlyStats[month].shiftCounts[data.shiftId] !== undefined) {
            monthlyStats[month].shiftCounts[data.shiftId]++;
          }
          const shift = shiftMap.get(data.shiftId);
          if (shift) {
            monthlyStats[month].totalHours += calculateHours(shift.startTime, shift.endTime);
          }
        }
      }
    }
    
    return monthlyStats;
  }, [year, calendarData, shifts]);
  
  const annualTotals = useMemo(() => {
    const totals = { shiftCounts: {} as Record<string, number>, totalHours: 0 };
    shifts.forEach(s => totals.shiftCounts[s.id] = 0);
    Object.keys(stats).forEach(monthKey => {
      const monthStat = stats[Number(monthKey)];
      Object.entries(monthStat.shiftCounts).forEach(([shiftId, count]: [string, number]) => {
          totals.shiftCounts[shiftId] += count;
      });
      totals.totalHours += monthStat.totalHours;
    });
    return totals;
  }, [stats, shifts]);

  const hourDifference = annualTotals.totalHours - targetAnnualHours;

  return (
    <div className="container mx-auto p-4 animate-fadeIn">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">Estadísticas Anuales - {year}</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-center">Resumen Anual</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 text-center mb-6">
            {shifts.map(shift => (
                <div key={shift.id} className="p-3 rounded-lg" style={{backgroundColor: `${shift.color}20`}}>
                    <div className="text-3xl font-bold" style={{color: shift.color}}>{annualTotals.shiftCounts[shift.id]}</div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{shift.name}</div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center border-t dark:border-gray-700 pt-6">
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex flex-col justify-center">
                <label htmlFor="targetHours" className="text-sm font-medium text-gray-600 dark:text-gray-300">Horas Previstas</label>
                <input
                    id="targetHours"
                    type="number"
                    value={targetAnnualHours || ''}
                    onChange={(e) => setTargetAnnualHours(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full text-center bg-transparent text-3xl font-bold text-gray-800 dark:text-gray-200 focus:outline-none p-0 border-0"
                />
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex flex-col justify-center">
                 <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{annualTotals.totalHours.toFixed(2)}</div>
                 <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Horas Realizadas</div>
            </div>
             <div className={`p-3 rounded-lg flex flex-col justify-center ${hourDifference >= 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                 <div className={`text-3xl font-bold ${hourDifference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {hourDifference >= 0 ? '+' : ''}{hourDifference.toFixed(2)}
                 </div>
                 <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Diferencia</div>
            </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {MONTH_NAMES.map((name, index) => (
          <div key={name} className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow-md">
            <h4 className="text-xl font-bold mb-3">{name}</h4>
            <div className="flex flex-wrap items-center gap-4">
                {shifts.map(shift => (
                    <div key={shift.id} className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full" style={{backgroundColor: shift.color}}></span>
                        <span className="font-semibold">{shift.id}:</span>
                        <span>{stats[index].shiftCounts[shift.id]}</span>
                    </div>
                ))}
                 <div className="ml-auto font-bold text-lg">
                    Total Horas: <span className="text-blue-600 dark:text-blue-400">{stats[index].totalHours.toFixed(2)}h</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// =============================================
// Contenido de: components/FullYearView.tsx
// =============================================
interface FullYearViewProps {
  year: number;
  calendarData: Record<string, DayData>;
  shifts: Shift[];
  holidays: Record<string, string>;
}

const FullYearView: React.FC<FullYearViewProps> = ({ year, calendarData, shifts, holidays }) => {
  const shiftMap: Map<string, Shift> = new Map(shifts.map(s => [s.id, s]));
  const daysInHeader = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-fadeIn printable-area">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400 print-hidden">Vista Anual Completa - {year}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-2 border border-gray-300 dark:border-gray-600 font-semibold text-sm min-w-[90px]">Mes</th>
              {daysInHeader.map(day => (
                <th key={day} className="p-2 border border-gray-300 dark:border-gray-600 font-semibold text-xs w-10">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MONTH_NAMES.map((monthName, monthIndex) => {
              const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
              return (
                <tr key={monthName} className="text-center">
                  <td className="p-2 border border-gray-300 dark:border-gray-600 font-bold bg-gray-50 dark:bg-gray-700/50 text-sm">{monthName}</td>
                  {daysInHeader.map(day => {
                    if (day > daysInMonth) {
                      return <td key={day} className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-900"></td>;
                    }

                    const date = new Date(Date.UTC(year, monthIndex, day));
                    const dateString = date.toISOString().split('T')[0];
                    const data = calendarData[dateString];
                    const holiday = holidays[dateString];
                    const shift = data?.shiftId ? shiftMap.get(data.shiftId) : undefined;
                    const dayOfWeek = date.getUTCDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                    let cellStyle: React.CSSProperties = {};
                    let content = '';

                    // Set base style for weekends
                    if (isWeekend) {
                        cellStyle.backgroundColor = 'rgba(243, 244, 246, 0.5)';
                        if (document.documentElement.classList.contains('dark')) {
                            cellStyle.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                        }
                    }
                    
                    if (shift) {
                      cellStyle.backgroundColor = `${shift.color}40`;
                      cellStyle.color = shift.color; // Default shift text color
                      content = shift.id;
                    } else if (holiday) {
                      cellStyle.backgroundColor = '#fecaca'; // red-200
                      if (document.documentElement.classList.contains('dark')) {
                        cellStyle.backgroundColor = 'rgba(153, 27, 27, 0.5)';
                      }
                      content = "F";
                    }

                    // Holiday text color takes precedence
                    if (holiday) {
                      cellStyle.color = '#dc2626'; // red-600
                      if (document.documentElement.classList.contains('dark')) {
                        cellStyle.color = '#f87171'; // red-400
                      }
                      cellStyle.fontWeight = 'bold';
                    } else if (shift) {
                      cellStyle.fontWeight = 'bold';
                    }

                    return (
                      <td key={day} className="p-2 border border-gray-300 dark:border-gray-600 text-xs h-10" style={cellStyle}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// =============================================
// Contenido de: components/EditDayModal.tsx
// =============================================
interface EditDayModalProps {
  date: Date;
  shifts: Shift[];
  currentShiftId: string | null | undefined;
  onSave: (date: Date, shiftId: string | null) => void;
  onClose: () => void;
}

const EditDayModal: React.FC<EditDayModalProps> = ({ date, shifts, currentShiftId, onSave, onClose }) => {
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(currentShiftId || null);
  
  const formattedDate = `${WEEK_DAY_NAMES_FULL[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`;

  const handleSave = () => {
    onSave(date, selectedShiftId);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center animate-fadeIn p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Editar Turno</h2>
          <p className="text-gray-500 dark:text-gray-400">{formattedDate}</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {shifts.map(shift => (
              <button
                key={shift.id}
                onClick={() => setSelectedShiftId(shift.id)}
                className={`p-4 rounded-lg text-center font-bold transition-all duration-200 ${selectedShiftId === shift.id ? 'ring-4' : ''}`}
                style={{
                  backgroundColor: `${shift.color}40`,
                  color: shift.color,
                  borderColor: shift.color,
                  ...(selectedShiftId === shift.id && { ringColor: shift.color }),
                }}
              >
                {shift.name} ({shift.id})
              </button>
            ))}
            <button
              onClick={() => setSelectedShiftId(null)}
              className={`p-4 rounded-lg text-center font-bold transition-all duration-200 border-2 border-dashed ${selectedShiftId === null ? 'ring-4 ring-gray-400 bg-gray-200 dark:bg-gray-600' : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
             >
                Sin Turno
              </button>
          </div>
        </div>
        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
          <button onClick={handleSave} className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Guardar</button>
        </div>
      </div>
    </div>
  );
};


// =============================================
// Contenido de: components/SettingsModal.tsx
// =============================================
interface SettingsModalProps {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  rotations: Rotation[];
  setRotations: React.Dispatch<React.SetStateAction<Rotation[]>>;
  customHolidays: Record<string, string>;
  setCustomHolidays: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  disabledNationalHolidays: Record<string, boolean>;
  setDisabledNationalHolidays: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  year: number;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  shifts, setShifts, rotations, setRotations, customHolidays, setCustomHolidays, disabledNationalHolidays, setDisabledNationalHolidays, year, onClose
}) => {
  const [localShifts, setLocalShifts] = useState<Shift[]>(shifts);
  const [localRotations, setLocalRotations] = useState<Rotation[]>(rotations.length > 0 ? rotations : [{ name: 'Principal', sequence: [], startDate: '' }]);
  const [localDisabledHolidays, setLocalDisabledHolidays] = useState(disabledNationalHolidays);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  
  const nationalHolidays = getSpanishHolidays(year);

  const handleShiftChange = (index: number, field: keyof Shift, value: string) => {
    const updated = [...localShifts];
    updated[index] = { ...updated[index], [field]: value };
    setLocalShifts(updated);
  };

  const addShift = () => {
    setLocalShifts([...localShifts, { id: '', name: '', color: '#3b82f6', startTime: '', endTime: '' }]);
  };

  const removeShift = (index: number) => {
    setLocalShifts(localShifts.filter((_, i) => i !== index));
  };
  
  const handleRotationChange = (field: keyof Rotation, value: string | string[]) => {
      const updated = [...localRotations];
      updated[0] = { ...updated[0], [field]: value };
      setLocalRotations(updated);
  };
  
  const addHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHolidayDate && newHolidayName) {
      setCustomHolidays(prev => ({...prev, [newHolidayDate]: newHolidayName}));
      setNewHolidayDate('');
      setNewHolidayName('');
    }
  };

  const removeHoliday = (dateString: string) => {
    const updated = {...customHolidays};
    delete updated[dateString];
    setCustomHolidays(updated);
  };
  
  const toggleNationalHoliday = (date: string) => {
    setLocalDisabledHolidays(prev => ({...prev, [date]: !prev[date]}));
  };

  const handleSave = () => {
    setShifts(localShifts);
    setRotations(localRotations);
    setDisabledNationalHolidays(localDisabledHolidays);
    onClose();
  };
  
  const mainRotation = localRotations[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-30 flex justify-center items-center animate-fadeIn p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configuración</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Shift Management */}
          <section>
            <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">Tipos de Turno</h3>
            <div className="space-y-3">
              {localShifts.map((shift, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <input type="text" placeholder="ID (ej. M)" value={shift.id} onChange={(e) => handleShiftChange(index, 'id', e.target.value)} className="md:col-span-1 p-2 rounded border dark:bg-gray-600 dark:border-gray-500" />
                  <input type="text" placeholder="Nombre" value={shift.name} onChange={(e) => handleShiftChange(index, 'name', e.target.value)} className="md:col-span-3 p-2 rounded border dark:bg-gray-600 dark:border-gray-500" />
                  <input type="time" value={shift.startTime} onChange={(e) => handleShiftChange(index, 'startTime', e.target.value)} className="md:col-span-2 p-2 rounded border dark:bg-gray-600 dark:border-gray-500" />
                  <input type="time" value={shift.endTime} onChange={(e) => handleShiftChange(index, 'endTime', e.target.value)} className="md:col-span-2 p-2 rounded border dark:bg-gray-600 dark:border-gray-500" />
                  <input type="color" value={shift.color} onChange={(e) => handleShiftChange(index, 'color', e.target.value)} className="md:col-span-1 p-1 h-10 w-full rounded border dark:bg-gray-600 dark:border-gray-500" />
                  <div className="md:col-span-2 flex justify-end">
                    <button onClick={() => removeShift(index)} className="text-red-500 hover:text-red-700 font-bold">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addShift} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Añadir Turno</button>
          </section>

          {/* Rotation Management */}
          <section>
            <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">Rotación Principal</h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md space-y-3">
              <div>
                  <label className="block font-medium mb-1">Secuencia de turnos (IDs separados por comas):</label>
                  <input
                    type="text"
                    placeholder="M,M,T,T,N,N,L,L"
                    value={mainRotation.sequence.join(',')}
                    onChange={(e) => handleRotationChange('sequence', e.target.value.split(',').map(s => s.trim()))}
                    className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500"
                  />
              </div>
               <div>
                  <label className="block font-medium mb-1">Fecha de inicio de la rotación:</label>
                  <input
                    type="date"
                    value={mainRotation.startDate}
                    onChange={(e) => handleRotationChange('startDate', e.target.value)}
                    className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500"
                  />
              </div>
            </div>
          </section>
          
          {/* Holiday Management */}
          <section>
            <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">Gestión de Festivos ({year})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold mb-2">Festivos Nacionales</h4>
                     <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md dark:border-gray-600">
                        {Object.entries(nationalHolidays).sort((a,b) => a[0].localeCompare(b[0])).map(([date, name]) => {
                            const isDisabled = localDisabledHolidays[date];
                            return (
                            <div key={date} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <span className={`text-sm ${isDisabled ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                {new Date(date + 'T00:00:00').toLocaleDateString(undefined, {month:'short', day:'numeric'})}: {name}
                                </span>
                                <button 
                                onClick={() => toggleNationalHoliday(date)} 
                                className={`px-2 py-1 text-xs rounded ${isDisabled ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                                >
                                {isDisabled ? 'Reactivar' : 'Desactivar'}
                                </button>
                            </div>
                            );
                        })}
                    </div>
                </div>
                <div>
                     <h4 className="font-semibold mb-2">Añadir Festivo Local / Personal</h4>
                    <form onSubmit={addHoliday} className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)} className="p-2 rounded border dark:bg-gray-600 dark:border-gray-500 w-full" />
                            <input type="text" placeholder="Nombre del festivo" value={newHolidayName} onChange={(e) => setNewHolidayName(e.target.value)} className="flex-grow p-2 rounded border dark:bg-gray-600 dark:border-gray-500 w-full" />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Añadir</button>
                    </form>
                    <div className="space-y-2 max-h-20 overflow-y-auto mt-2 border p-2 rounded-md dark:border-gray-600">
                    {Object.entries(customHolidays).filter(([date]) => date.startsWith(year.toString())).sort((a,b) => a[0].localeCompare(b[0])).map(([date, name]) => (
                        <div key={date} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <span className="text-sm">{new Date(date + 'T00:00:00').toLocaleDateString(undefined, {month:'short', day:'numeric'})}: {name}</span>
                        <button onClick={() => removeHoliday(date)} className="text-red-500 hover:text-red-700 text-xs font-bold">Eliminar</button>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
          </section>
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};


// =============================================
// Contenido de: App.tsx
// =============================================
function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [view, setView] = useLocalStorage<View>('view', 'calendar');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  const [shifts, setShifts] = useLocalStorage<Shift[]>('shifts', [
    { id: 'M', name: 'Mañana', color: COLORS[0], startTime: '06:00', endTime: '14:00' },
    { id: 'T', name: 'Tarde', color: COLORS[4], startTime: '14:00', endTime: '22:00' },
    { id: 'N', name: 'Noche', color: COLORS[10], startTime: '22:00', endTime: '06:00' },
    { id: 'L', name: 'Libre', color: COLORS[5], startTime: '', endTime: '' },
  ]);

  const [rotations, setRotations] = useLocalStorage<Rotation[]>('rotations', []);
  const [calendarData, setCalendarData] = useLocalStorage<Record<string, DayData>>('calendarData', {});
  const [customHolidays, setCustomHolidays] = useLocalStorage<Record<string, string>>('customHolidays', {});
  const [disabledNationalHolidays, setDisabledNationalHolidays] = useLocalStorage<Record<string, boolean>>('disabledNationalHolidays', {});
  const [targetAnnualHours, setTargetAnnualHours] = useLocalStorage('targetAnnualHours', 1680);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const holidays = useMemo(() => {
    const national = getSpanishHolidays(year);

    // Filter out disabled holidays
    for (const dateString in disabledNationalHolidays) {
      if (disabledNationalHolidays[dateString] && national[dateString] && dateString.startsWith(year.toString())) {
        delete national[dateString];
      }
    }

    const customForYear = Object.entries(customHolidays)
      .filter(([date]) => date.startsWith(year.toString()))
      .reduce((acc, [date, name]) => ({ ...acc, [date]: name }), {});
      
    return { ...national, ...customForYear };
  }, [year, customHolidays, disabledNationalHolidays]);

  const applyRotation = useCallback(() => {
    if (rotations.length === 0 || !rotations[0].startDate || rotations[0].sequence.length === 0) {
      return;
    }

    const mainRotation = rotations[0];
    const sequence = mainRotation.sequence;
    const sequenceLength = sequence.length;

    const startDate = new Date(mainRotation.startDate + 'T00:00:00');
    if (isNaN(startDate.getTime())) return;

    const newData: Record<string, DayData> = {};
    const today = new Date();
    const currentYear = today.getFullYear();

    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = new Date(year, month, day);

          if (currentDate >= startDate) {
            const diffTime = currentDate.getTime() - startDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0) {
              const sequenceIndex = diffDays % sequenceLength;
              const shiftId = sequence[sequenceIndex];
              const dateString = currentDate.toISOString().split('T')[0];

              if (shifts.some(s => s.id === shiftId)) {
                newData[dateString] = { shiftId };
              }
            }
          }
        }
      }
    }

    setCalendarData(prev => ({ ...prev, ...newData }));
  }, [rotations, shifts, setCalendarData]);

  useEffect(() => {
    applyRotation();
  }, [applyRotation]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  
  const handleDayClick = (date: Date) => {
    setEditingDate(date);
  };
  
  const handleSaveDay = (date: Date, shiftId: string | null) => {
    const dateString = date.toISOString().split('T')[0];
    setCalendarData(prev => ({
      ...prev,
      [dateString]: { shiftId }
    }));
    setEditingDate(null);
  };
  
  const handleExport = () => {
    const dataToExport = {
      shifts,
      rotations,
      calendarData,
      customHolidays,
      disabledNationalHolidays,
      targetAnnualHours
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cuadrante_turnos_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = JSON.parse(e.target?.result as string);
        if (result.shifts) setShifts(result.shifts);
        if (result.rotations) setRotations(result.rotations);
        if (result.calendarData) setCalendarData(result.calendarData);
        if (result.customHolidays) setCustomHolidays(result.customHolidays);
        if (result.disabledNationalHolidays) setDisabledNationalHolidays(result.disabledNationalHolidays);
        if (result.targetAnnualHours) setTargetAnnualHours(result.targetAnnualHours);
        alert('Datos importados correctamente.');
      } catch (error) {
        alert('Error al importar el archivo. Asegúrate de que es un JSON válido.');
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };
  
  const handleDuplicateYear = () => {
    if(!window.confirm(`¿Seguro que quieres duplicar los turnos del año ${year-1} a ${year}? Esto sobreescribirá los datos existentes para ${year}.`)) return;

    const prevYearData = Object.entries(calendarData).filter(([date]) => date.startsWith((year-1).toString()));
    
    const newYearData: Record<string, DayData> = {};
    prevYearData.forEach(([date, data]) => {
      const newDate = new Date(date);
      newDate.setFullYear(year);
      newYearData[newDate.toISOString().split('T')[0]] = data;
    });

    setCalendarData(prev => ({...prev, ...newYearData}));
  };
  
  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
      <Header
        year={year}
        setYear={setYear}
        view={view}
        setView={setView}
        onSettings={() => setIsSettingsOpen(true)}
        onExport={handleExport}
        onImport={handleImport}
        onPrint={handlePrint}
        theme={theme}
        toggleTheme={toggleTheme}
        shifts={shifts}
        filter={filter}
        setFilter={setFilter}
        onDuplicateYear={handleDuplicateYear}
      />
      <main className="container mx-auto p-2 sm:p-4">
        {view === 'calendar' && (
          <Calendar
            year={year}
            calendarData={calendarData}
            shifts={shifts}
            holidays={holidays}
            onDayClick={handleDayClick}
            filter={filter}
          />
        )}
        {view === 'stats' && (
          <StatsView
            year={year}
            calendarData={calendarData}
            shifts={shifts}
            targetAnnualHours={targetAnnualHours}
            setTargetAnnualHours={setTargetAnnualHours}
          />
        )}
        {view === 'full_year' && (
          <FullYearView
            year={year}
            calendarData={calendarData}
            shifts={shifts}
            holidays={holidays}
          />
        )}
      </main>
      
      {isSettingsOpen && (
        <SettingsModal
          shifts={shifts}
          setShifts={setShifts}
          rotations={rotations}
          setRotations={setRotations}
          customHolidays={customHolidays}
          setCustomHolidays={setCustomHolidays}
          disabledNationalHolidays={disabledNationalHolidays}
          setDisabledNationalHolidays={setDisabledNationalHolidays}
          year={year}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
      
      {editingDate && (
        <EditDayModal
          date={editingDate}
          shifts={shifts}
          currentShiftId={calendarData[editingDate.toISOString().split('T')[0]]?.shiftId}
          onSave={handleSaveDay}
          onClose={() => setEditingDate(null)}
        />
      )}
    </div>
  );
}


// =============================================
// Contenido de: index.tsx (original)
// =============================================
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
