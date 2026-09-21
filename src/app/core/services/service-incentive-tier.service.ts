import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/common.models';
import { ServiceIncentiveTier } from '../models/payroll.models';

@Injectable({ providedIn: 'root' })
export class ServiceIncentiveTierService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/service-incentive-tiers`;

  getAll(): Observable<ApiResponse<ServiceIncentiveTier[]>> {
    return this.http.get<ApiResponse<ServiceIncentiveTier[]>>(this.baseUrl);
  }

  create(dto: Omit<ServiceIncentiveTier, 'id'>): Observable<ApiResponse<ServiceIncentiveTier>> {
    return this.http.post<ApiResponse<ServiceIncentiveTier>>(this.baseUrl, dto);
  }

  update(id: number, dto: ServiceIncentiveTier): Observable<ApiResponse<ServiceIncentiveTier>> {
    return this.http.put<ApiResponse<ServiceIncentiveTier>>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }
}
