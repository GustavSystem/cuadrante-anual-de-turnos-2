
export interface Shift {
  id: string;
  name: string;
  color: string;
  startTime: string;
  endTime: string;
}

export interface DayData {
  shiftId: string | null;
}

export interface Rotation {
  name: string;
  sequence: string[];
  startDate: string;
}

export type View = 'calendar' | 'stats' | 'full_year';
