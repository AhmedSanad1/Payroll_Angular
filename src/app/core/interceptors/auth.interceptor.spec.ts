import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { Mock, vi } from 'vitest';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let refresh: Mock<() => Observable<boolean>>;
  let navigate: Mock<(commands: unknown[], extras?: unknown) => Promise<boolean>>;

  beforeEach(() => {
    refresh = vi.fn();
    navigate = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { accessToken: 'stale-token', refresh: () => refresh() } },
        { provide: LanguageService, useValue: { language: () => 'en' } },
        { provide: Router, useValue: { url: '/employees', navigate } }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // The route guard only runs on navigation, so a dead session on a page the user is
  // already sitting on has to be pushed to /login from here.
  it('redirects to login when the session can no longer be refreshed', async () => {
    refresh.mockReturnValue(of(false));

    const failed = new Promise((resolve) => http.get('/api/employees').subscribe({ error: resolve }));
    httpMock.expectOne('/api/employees').flush('', { status: 401, statusText: 'Unauthorized' });
    await failed;

    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/employees' } });
  });

  it('retries the original request and stays put when the refresh succeeds', async () => {
    refresh.mockReturnValue(of(true));

    const result = firstValueFrom(http.get('/api/employees'));
    httpMock.expectOne('/api/employees').flush('', { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne('/api/employees').flush({ object: [] });

    await expect(result).resolves.toEqual({ object: [] });
    expect(navigate).not.toHaveBeenCalled();
  });
});
