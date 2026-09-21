import { AttendanceAdjustmentType, PayrollCalculationMode } from './payroll.models';

export enum PayrollRunStatus {
  Draft = 1,
  Approved = 2
}

export interface PayrollRunListItem {
  id: number;
  periodYear: number;
  periodMonth: number;
  status: PayrollRunStatus;
  calculationMode: PayrollCalculationMode;
  generatedAt: string;
  approvedAt?: string | null;
  employeeCount: number;
  totalNetSalary: number;
}

export interface PayrollRunDetail {
  id: number;
  periodYear: number;
  periodMonth: number;
  status: PayrollRunStatus;
  calculationMode: PayrollCalculationMode;
  generatedAt: string;
  approvedAt?: string | null;
  employeeCount: number;
  totalBaseSalary: number;
  totalDeptIncentive: number;
  totalServiceIncentive: number;
  totalAttendanceAdjustment: number;
  totalNetSalary: number;
}

export interface PayrollItem {
  id: number;
  payrollRunId: number;
  employeeId: number;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  jobGradeId: number;
  gradeName: string;
  baseSalary: number;
  deptIncentivePercent: number;
  deptIncentiveAmount: number;
  serviceYears: number;
  serviceIncentivePercent: number;
  serviceIncentiveAmount: number;
  absentDays: number;
  attendanceAdjustmentType: AttendanceAdjustmentType | null;
  attendancePercent: number;
  attendanceAmount: number;
  netSalary: number;
}
