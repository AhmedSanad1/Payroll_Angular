import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageList } from '../models/common.models';
import { Department, DepartmentLookup } from '../models/payroll.models';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/departments`;

  getPaged(
    pageNumber: number,
    pageSize: number,
    search?: string,
    sortBy?: string,
    sortDescending = false
  ): Observable<ApiResponse<PageList<Department>>> {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize).set('sortDescending', sortDescending);
    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);

    return this.http.get<ApiResponse<PageList<Department>>>(this.baseUrl, { params });
  }

  getLookup(): Observable<ApiResponse<DepartmentLookup[]>> {
    return this.http.get<ApiResponse<DepartmentLookup[]>>(`${this.baseUrl}/lookup`);
  }

  getById(id: number): Observable<ApiResponse<Department>> {
    return this.http.get<ApiResponse<Department>>(`${this.baseUrl}/${id}`);
  }

  create(dto: Omit<Department, 'id'>): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(this.baseUrl, dto);
  }

  update(id: number, dto: Department): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }
}
