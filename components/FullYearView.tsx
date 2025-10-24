import React from 'react';
import { Shift, DayData } from '../types';
import { MONTH_NAMES } from '../constants';

interface FullYearViewProps {
  year: number;
  calendarData: Record<string, DayData>;
  shifts: Shift[];
  holidays: Record<string, string>;
}

export const FullYearView: React.FC<FullYearViewProps> = ({ year, calendarData, shifts, holidays }) => {
  const shiftMap = new Map(shifts.map(s => [s.id, s]));
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

                    const date = new Date(year, monthIndex, day);
                    const dateString = date.toISOString().split('T')[0];
                    const data = calendarData[dateString];
                    const holiday = holidays[dateString];
                    const shift = data?.shiftId ? shiftMap.get(data.shiftId) : undefined;

                    let cellStyle: React.CSSProperties = {};
                    let content = data?.shiftId || '';

                    if (holiday) {
                      cellStyle.backgroundColor = '#fecaca'; // red-200
                      cellStyle.color = '#dc2626'; // red-600
                      cellStyle.fontWeight = 'bold';
                      content = "F";
                    } else if (shift) {
                      cellStyle.backgroundColor = `${shift.color}40`; // Add alpha
                      cellStyle.color = shift.color;
                      cellStyle.fontWeight = 'bold';
                    } else {
                        const dayOfWeek = date.getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        if (isWeekend) {
                            cellStyle.backgroundColor = 'rgba(243, 244, 246, 0.5)';
                            if (document.documentElement.classList.contains('dark')) {
                                cellStyle.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                            }
                        }
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
