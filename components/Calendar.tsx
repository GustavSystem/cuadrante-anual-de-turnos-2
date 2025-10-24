
import React from 'react';
import { Shift, DayData } from '../types';
import { MONTH_NAMES, WEEK_DAY_NAMES } from '../constants';

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
  const dayOfMonth = date.getDate();
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let cellBgColor = 'bg-white dark:bg-gray-800';
  let textColor = 'text-gray-700 dark:text-gray-300';
  let shiftId = data.shiftId;
  
  if (holiday) {
    cellBgColor = 'bg-red-100 dark:bg-red-900/50';
    textColor = 'text-red-600 dark:text-red-400 font-bold';
    shiftId = "F";
  } else if (shift) {
    cellBgColor = 'bg-opacity-20'; // Handled by inline style
    textColor = 'text-gray-900 dark:text-white';
  } else if (isWeekend) {
    cellBgColor = 'bg-gray-50 dark:bg-gray-800/50';
  }

  const shiftStyle = shift ? { backgroundColor: `${shift.color}40`, border: `1px solid ${shift.color}` } : {};

  return (
    <div
      className={`relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-md cursor-pointer transition-transform transform hover:scale-105 ${cellBgColor} ${isFilteredOut ? 'opacity-20' : ''}`}
      style={shiftStyle}
      onClick={onClick}
      title={holiday || shift?.name || ''}
    >
      <span className={`absolute top-0.5 right-1 text-xs ${textColor} opacity-70`}>{WEEK_DAY_NAMES[dayOfWeek]}</span>
      
      {shiftId ? (
        <>
          <span className={`absolute top-0.5 left-1.5 text-sm font-medium ${textColor}`}>{dayOfMonth}</span>
          <span
            className="text-xl font-bold"
            style={{ color: shift ? shift.color : (holiday ? 'rgb(220 38 38)' : 'inherit') }}
          >
            {holiday ? 'F' : shift?.id}
          </span>
        </>
      ) : (
        <span className={`text-lg font-medium ${textColor}`}>{dayOfMonth}</span>
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
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const shiftMap = new Map(shifts.map(s => [s.id, s]));

  const renderDays = () => {
    const days = [];
    // Add blank days for the first week
    for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
      days.push(<div key={`blank-${i}`} className="w-10 h-10 sm:w-12 sm:h-12" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
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

export const Calendar: React.FC<CalendarProps> = (props) => {
  return (
    <div className="space-y-6">
      {MONTH_NAMES.map((_, index) => (
        <MonthGrid key={index} month={index} {...props} />
      ))}
    </div>
  );
};
