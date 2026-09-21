import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageList } from '../models/common.models';
import { PayrollItem, PayrollRunDetail, PayrollRunListItem } from '../models/payroll-run.models';

@Injectable({ providedIn: 'root' })
export class PayrollRunService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payroll-runs`;

  getPaged(pageNumber: number, pageSize: number): Observable<ApiResponse<PageList<PayrollRunListItem>>> {
    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    return this.http.get<ApiResponse<PageList<PayrollRunListItem>>>(this.baseUrl, { params });
  }

  generate(year: number, month: number): Observable<ApiResponse<PayrollRunDetail>> {
    return this.http.post<ApiResponse<PayrollRunDetail>>(this.baseUrl, { year, month });
  }

  getById(id: number): Observable<ApiResponse<PayrollRunDetail>> {
    return this.http.get<ApiResponse<PayrollRunDetail>>(`${this.baseUrl}/${id}`);
  }

  getItems(
    id: number,
    pageNumber: number,
    pageSize: number,
    departmentId?: number | null,
    search?: string
  ): Observable<ApiResponse<PageList<PayrollItem>>> {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    if (departmentId) params = params.set('departmentId', departmentId);
    if (search) params = params.set('search', search);

    return this.http.get<ApiResponse<PageList<PayrollItem>>>(`${this.baseUrl}/${id}/items`, { params });
  }

  approve(id: number): Observable<ApiResponse<PayrollRunDetail>> {
    return this.http.post<ApiResponse<PayrollRunDetail>>(`${this.baseUrl}/${id}/approve`, {});
  }
}
