import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/common.models';
import { ToastService } from '../services/toast.service';

// 401 is excluded — the auth interceptor already handles it (refresh + retry or logout).
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const toast = inject(ToastService);
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status !== 401) {
        const body = error.error as ApiResponse<unknown> | undefined;
        toast.error(body?.message ?? translate.instant('errors.generic'));
      }
      return throwError(() => error);
    })
  );
};
