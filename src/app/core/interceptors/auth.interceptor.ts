import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';

// Attaches the access token and the active UI language; on 401, refreshes once
// (via cookie) and retries. When that refresh fails the session is gone, so it also
// sends the user to the login page — the route guard only runs on navigation, which
// would leave anyone sitting on a page stuck there after their session died.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const languageService = inject(LanguageService);
  const router = inject(Router);

  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
  const token = authService.accessToken;

  const authReq = req.clone({
    withCredentials: true,
    setHeaders: {
      'Accept-Language': languageService.language(),
      ...(token && !isAuthEndpoint ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
        return authService.refresh().pipe(
          switchMap((refreshed) => {
            if (!refreshed) {
              // refresh() already cleared the session; get off the now-dead page,
              // remembering it so login can bring them straight back.
              if (!router.url.startsWith('/login')) {
                void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
              }
              return throwError(() => error);
            }
            const retryReq = req.clone({
              withCredentials: true,
              setHeaders: {
                'Accept-Language': languageService.language(),
                Authorization: `Bearer ${authService.accessToken}`
              }
            });
            return next(retryReq);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
