import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authenticated: boolean;

  const runGuard = (url: string) =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot)
    );

  beforeEach(() => {
    authenticated = true;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => authenticated } }
      ]
    });
  });

  it('lets an authenticated user through', () => {
    expect(runGuard('/payroll/7')).toBe(true);
  });

  it('sends an unauthenticated user to login, remembering where they were headed', () => {
    authenticated = false;

    const result = runGuard('/payroll/7');

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fpayroll%2F7');
  });
});
