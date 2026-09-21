export interface JobGrade {
  id: number;
  nameAr: string;
  nameEn: string;
  baseSalary: number;
}

export interface Department {
  id: number;
  name: string;
  incentivePercent: number;
}

export interface DepartmentLookup {
  id: number;
  name: string;
}

export interface ServiceIncentiveTier {
  id: number;
  minYearsExceeded: number;
  percent: number;
}

export enum AttendanceAdjustmentType {
  Bonus = 1,
  Deduction = 2
}

export interface AttendanceRule {
  id: number;
  fromDays: number;
  toDays: number | null;
  adjustmentType: AttendanceAdjustmentType;
  percent: number;
}

export enum PayrollCalculationMode {
  Additive = 1,
  Compound = 2
}

export interface PayrollSettings {
  calculationMode: PayrollCalculationMode;
}

export interface Employee {
  id: number;
  fullName: string;
  birthDate: string;
  address: string;
  phone: string;
  email: string;
  jobGradeId: number;
  departmentId: number;
  hireDate: string;
}

export interface EmployeeListItem {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  jobGradeId: number;
  gradeName: string;
  hireDate: string;
}
