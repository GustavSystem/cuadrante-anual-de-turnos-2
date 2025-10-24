
// This is a simplified list. For production, a more robust solution like an API would be better.
export const getSpanishHolidays = (year: number): Record<string, string> => {
  const easterDate = getEaster(year);
  const holidays: Record<string, Date> = {
    "Año Nuevo": new Date(year, 0, 1),
    "Epifanía del Señor": new Date(year, 0, 6),
    "Viernes Santo": new Date(easterDate.setDate(easterDate.getDate() - 2)),
    "Fiesta del Trabajo": new Date(year, 4, 1),
    "Asunción de la Virgen": new Date(year, 7, 15),
    "Fiesta Nacional de España": new Date(year, 9, 12),
    "Día de todos los Santos": new Date(year, 10, 1),
    "Día de la Constitución Española": new Date(year, 11, 6),
    "Inmaculada Concepción": new Date(year, 11, 8),
    "Navidad": new Date(year, 11, 25),
  };
    // Jueves Santo can be regional
    holidays["Jueves Santo"] = new Date(easterDate.setDate(easterDate.getDate() - 1));


  const holidayMap: Record<string, string> = {};
  for (const name in holidays) {
    const date = holidays[name];
    if (date.getFullYear() === year) {
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
  return new Date(year, month - 1, day);
}
