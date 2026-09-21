import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AbsenceBatchRequest, AbsenceMonthGrid } from '../models/absence.models';
import { ApiResponse } from '../models/common.models';

@Injectable({ providedIn: 'root' })
export class AbsenceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/absences`;

  getMonthGrid(year: number, month: number, departmentId?: number | null): Observable<ApiResponse<AbsenceMonthGrid>> {
    let params = new HttpParams().set('year', year).set('month', month);
    if (departmentId) params = params.set('departmentId', departmentId);

    return this.http.get<ApiResponse<AbsenceMonthGrid>>(`${this.baseUrl}/month`, { params });
  }

  applyBatch(request: AbsenceBatchRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/batch`, request);
  }
}
