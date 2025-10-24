import React, { useState } from 'react';
import { Shift } from '../types.ts';
import { WEEK_DAY_NAMES_FULL, MONTH_NAMES } from '../constants.ts';

interface EditDayModalProps {
  date: Date;
  shifts: Shift[];
  currentShiftId: string | null | undefined;
  onSave: (date: Date, shiftId: string | null) => void;
  onClose: () => void;
}

export const EditDayModal: React.FC<EditDayModalProps> = ({ date, shifts, currentShiftId, onSave, onClose }) => {
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