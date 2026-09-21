import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/common.models';
import {
  AttendanceReportRow,
  EmployeeReportRow,
  IncentiveDeductionReportRow,
  SalaryReportRow
} from '../models/report.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  getAttendanceReport(year: number, month: number, departmentId?: number | null): Observable<ApiResponse<AttendanceReportRow[]>> {
    let params = new HttpParams().set('year', year).set('month', month);
    if (departmentId) params = params.set('departmentId', departmentId);
    return this.http.get<ApiResponse<AttendanceReportRow[]>>(`${this.baseUrl}/attendance`, { params });
  }

  getIncentivesDeductionsReport(runId: number, departmentId?: number | null): Observable<ApiResponse<IncentiveDeductionReportRow[]>> {
    let params = new HttpParams().set('runId', runId);
    if (departmentId) params = params.set('departmentId', departmentId);
    return this.http.get<ApiResponse<IncentiveDeductionReportRow[]>>(`${this.baseUrl}/incentives-deductions`, { params });
  }

  getEmployeesReport(departmentId?: number | null, jobGradeId?: number | null): Observable<ApiResponse<EmployeeReportRow[]>> {
    let params = new HttpParams();
    if (departmentId) params = params.set('departmentId', departmentId);
    if (jobGradeId) params = params.set('jobGradeId', jobGradeId);
    return this.http.get<ApiResponse<EmployeeReportRow[]>>(`${this.baseUrl}/employees`, { params });
  }

  getSalariesReport(runId: number, departmentId?: number | null): Observable<ApiResponse<SalaryReportRow[]>> {
    let params = new HttpParams().set('runId', runId);
    if (departmentId) params = params.set('departmentId', departmentId);
    return this.http.get<ApiResponse<SalaryReportRow[]>>(`${this.baseUrl}/salaries`, { params });
  }

  // PDF variants: the API renders the same rows through its RDLC definitions
  // (`/api/reports/{name}/pdf`). Fetched as a Blob so the auth interceptor can attach the
  // bearer token — a plain <a href> to the endpoint would arrive without it and get 401.
  getAttendanceReportPdf(year: number, month: number, departmentId?: number | null): Observable<Blob> {
    let params = new HttpParams().set('year', year).set('month', month);
    if (departmentId) params = params.set('departmentId', departmentId);
    return this.http.get(`${this.baseUrl}/attendance/pdf`, { params, responseType: 'blob' });
  }

  getIncentivesDeductionsReportPdf(runId: number, departmentId?: number | null): Observable<Blob> {
    let params = new HttpParams().set('runId', runId);
    if (departmentId) params = params.set('departmentId', departmentId);
    return this.http.get(`${this.baseUrl}/incentives-deductions/pdf`, { params, responseType: 'blob' });
  }

  getEmployeesReportPdf(departmentId?: number | null, jobGradeId?: number | null): Observable<Blob> {
    let params = new HttpParams();
    if (departmentId) params = params.set('departmentId', departmentId);
    if (jobGradeId) params = params.set('jobGradeId', jobGradeId);
    return this.http.get(`${this.baseUrl}/employees/pdf`, { params, responseType: 'blob' });
  }

  getSalariesReportPdf(runId: number, departmentId?: number | null): Observable<Blob> {
    let params = new HttpParams().set('runId', runId);
    if (departmentId) params = params.set('departmentId', departmentId);
    return this.http.get(`${this.baseUrl}/salaries/pdf`, { params, responseType: 'blob' });
  }
}
