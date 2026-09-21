import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggedUser, LoginRequest } from '../models/auth.models';
import { ApiResponse } from '../models/common.models';

// Access token lives only in memory; the refresh token never reaches JS (httpOnly cookie).
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly usernameSignal = signal<string | null>(null);

  readonly isAuthenticated = computed(() => this.accessTokenSignal() !== null);
  readonly username = computed(() => this.usernameSignal());

  private refreshInFlight$: Observable<boolean> | null = null;

  get accessToken(): string | null {
    return this.accessTokenSignal();
  }

  login(request: LoginRequest): Observable<ApiResponse<LoggedUser>> {
    return this.http
      .post<ApiResponse<LoggedUser>>(`${this.baseUrl}/login`, request, { withCredentials: true })
      .pipe(tap((response) => this.applySession(response)));
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  // Used at startup (restore session after reload) and by the interceptor on 401. Deduped.
  refresh(): Observable<boolean> {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.http
        .post<ApiResponse<LoggedUser>>(`${this.baseUrl}/refresh`, {}, { withCredentials: true })
        .pipe(
          map((response) => {
            this.applySession(response);
            return response.object != null;
          }),
          catchError(() => {
            this.clearSession();
            return of(false);
          }),
          finalize(() => (this.refreshInFlight$ = null)),
          shareReplay(1)
        );
    }

    return this.refreshInFlight$;
  }

  clearSession(): void {
    this.accessTokenSignal.set(null);
    this.usernameSignal.set(null);
  }

  private applySession(response: ApiResponse<LoggedUser>): void {
    if (response.object) {
      this.accessTokenSignal.set(response.object.accessToken);
      this.usernameSignal.set(response.object.username);
    }
  }
}
