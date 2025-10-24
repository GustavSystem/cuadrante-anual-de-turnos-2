
import React, { useState } from 'react';
import { Shift, Rotation } from '../types';
import { COLORS } from '../constants';

interface SettingsModalProps {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  rotations: Rotation[];
  setRotations: React.Dispatch<React.SetStateAction<Rotation[]>>;
  customHolidays: Record<string, string>;
  setCustomHolidays: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  year: number;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  shifts, setShifts, rotations, setRotations, customHolidays, setCustomHolidays, year, onClose
}) => {
  const [localShifts, setLocalShifts] = useState<Shift[]>(shifts);
  const [localRotations, setLocalRotations] = useState<Rotation[]>(rotations.length > 0 ? rotations : [{ name: 'Principal', sequence: [], startDate: '' }]);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');

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

  const handleSave = () => {
    setShifts(localShifts);
    setRotations(localRotations);
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
            <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">Festivos Locales / Autonómicos ({year})</h3>
            <form onSubmit={addHoliday} className="flex gap-2 mb-4">
              <input type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)} className="p-2 rounded border dark:bg-gray-600 dark:border-gray-500" />
              <input type="text" placeholder="Nombre del festivo" value={newHolidayName} onChange={(e) => setNewHolidayName(e.target.value)} className="flex-grow p-2 rounded border dark:bg-gray-600 dark:border-gray-500" />
              <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Añadir</button>
            </form>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(customHolidays).filter(([date]) => date.startsWith(year.toString())).map(([date, name]) => (
                <div key={date} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <span>{date}: {name}</span>
                  <button onClick={() => removeHoliday(date)} className="text-red-500 hover:text-red-700 font-bold">Eliminar</button>
                </div>
              ))}
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
