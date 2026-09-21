export interface AbsenceGridEmployeeRow {
  employeeId: number;
  fullName: string;
  absenceDates: string[];
}

export interface AbsenceMonthGrid {
  employees: AbsenceGridEmployeeRow[];
  isLocked: boolean;
}

export interface AbsenceEntry {
  employeeId: number;
  date: string;
}

export interface AbsenceBatchRequest {
  add: AbsenceEntry[];
  remove: AbsenceEntry[];
}

export interface EmployeeAbsence {
  id: number;
  absenceDate: string;
  notes?: string | null;
}
