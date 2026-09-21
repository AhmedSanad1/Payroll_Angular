import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/common.models';
import { JobGrade } from '../models/payroll.models';

@Injectable({ providedIn: 'root' })
export class JobGradeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/job-grades`;

  getAll(): Observable<ApiResponse<JobGrade[]>> {
    return this.http.get<ApiResponse<JobGrade[]>>(this.baseUrl);
  }

  update(id: number, dto: JobGrade): Observable<ApiResponse<JobGrade>> {
    return this.http.put<ApiResponse<JobGrade>>(`${this.baseUrl}/${id}`, dto);
  }
}
