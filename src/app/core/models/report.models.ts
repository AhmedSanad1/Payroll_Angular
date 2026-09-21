export interface AttendanceReportRow {
  employeeId: number;
  fullName: string;
  departmentId: number;
  departmentName: string;
  absentDays: number;
}

export interface IncentiveDeductionReportRow {
  employeeId: number;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  deptIncentiveAmount: number;
  serviceIncentiveAmount: number;
  attendanceAmount: number;
  netSalary: number;
}

export interface EmployeeReportRow {
  employeeId: number;
  fullName: string;
  email: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  jobGradeId: number;
  gradeName: string;
  hireDate: string;
}

export interface SalaryReportRow {
  employeeId: number;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  baseSalary: number;
  netSalary: number;
}
