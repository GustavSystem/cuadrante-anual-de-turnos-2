
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Calendar } from './components/Calendar';
import { StatsView } from './components/StatsView';
import { SettingsModal } from './components/SettingsModal';
import { EditDayModal } from './components/EditDayModal';
import { FullYearView } from './components/FullYearView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getSpanishHolidays } from './services/holidays';
import { Shift, DayData, Rotation, View } from './types';
import { COLORS } from './constants';

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
  const [targetAnnualHours, setTargetAnnualHours] = useLocalStorage('targetAnnualHours', 1680);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const holidays = useMemo(() => {
    const national = getSpanishHolidays(year);
    const customForYear = Object.entries(customHolidays)
      .filter(([date]) => date.startsWith(year.toString()))
      .reduce((acc, [date, name]) => ({ ...acc, [date]: name }), {});
    return { ...national, ...customForYear };
  }, [year, customHolidays]);

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

export default App;
