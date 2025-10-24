import React, { useMemo } from 'react';
import { Shift, DayData } from '../types';
import { MONTH_NAMES } from '../constants';

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

export const StatsView: React.FC<StatsViewProps> = ({ year, calendarData, shifts, targetAnnualHours, setTargetAnnualHours }) => {

  const stats = useMemo(() => {
    const monthlyStats: { [month: number]: { shiftCounts: Record<string, number>, totalHours: number } } = {};
    const shiftMap = new Map(shifts.map(s => [s.id, s]));

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
      Object.entries(monthStat.shiftCounts).forEach(([shiftId, count]) => {
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