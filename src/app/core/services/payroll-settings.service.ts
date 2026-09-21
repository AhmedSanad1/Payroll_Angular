import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/common.models';
import { PayrollSettings } from '../models/payroll.models';

@Injectable({ providedIn: 'root' })
export class PayrollSettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payroll-settings`;

  get(): Observable<ApiResponse<PayrollSettings>> {
    return this.http.get<ApiResponse<PayrollSettings>>(this.baseUrl);
  }

  update(dto: PayrollSettings): Observable<ApiResponse<PayrollSettings>> {
    return this.http.put<ApiResponse<PayrollSettings>>(this.baseUrl, dto);
  }
}
