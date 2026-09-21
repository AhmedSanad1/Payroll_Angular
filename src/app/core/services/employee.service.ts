import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmployeeAbsence } from '../models/absence.models';
import { ApiResponse, PageList } from '../models/common.models';
import { Employee, EmployeeListItem } from '../models/payroll.models';
import { PayrollItem } from '../models/payroll-run.models';

export interface EmployeeQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  departmentId?: number | null;
  jobGradeId?: number | null;
  sortBy?: string;
  sortDescending?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/employees`;

  getPaged(query: EmployeeQuery): Observable<ApiResponse<PageList<EmployeeListItem>>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize)
      .set('sortDescending', query.sortDescending ?? false);

    if (query.search) params = params.set('search', query.search);
    if (query.departmentId) params = params.set('departmentId', query.departmentId);
    if (query.jobGradeId) params = params.set('jobGradeId', query.jobGradeId);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);

    return this.http.get<ApiResponse<PageList<EmployeeListItem>>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.baseUrl}/${id}`);
  }

  create(dto: Omit<Employee, 'id'>): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(this.baseUrl, dto);
  }

  update(id: number, dto: Employee): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }

  getAbsences(id: number, year: number, month: number): Observable<ApiResponse<EmployeeAbsence[]>> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<ApiResponse<EmployeeAbsence[]>>(`${this.baseUrl}/${id}/absences`, { params });
  }

  getPayslip(id: number, runId: number): Observable<ApiResponse<PayrollItem>> {
    const params = new HttpParams().set('runId', runId);
    return this.http.get<ApiResponse<PayrollItem>>(`${this.baseUrl}/${id}/payslip`, { params });
  }
}
