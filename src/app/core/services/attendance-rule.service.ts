import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/common.models';
import { AttendanceRule } from '../models/payroll.models';

@Injectable({ providedIn: 'root' })
export class AttendanceRuleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/attendance-rules`;

  getAll(): Observable<ApiResponse<AttendanceRule[]>> {
    return this.http.get<ApiResponse<AttendanceRule[]>>(this.baseUrl);
  }

  create(dto: Omit<AttendanceRule, 'id'>): Observable<ApiResponse<AttendanceRule>> {
    return this.http.post<ApiResponse<AttendanceRule>>(this.baseUrl, dto);
  }

  update(id: number, dto: AttendanceRule): Observable<ApiResponse<AttendanceRule>> {
    return this.http.put<ApiResponse<AttendanceRule>>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }
}
