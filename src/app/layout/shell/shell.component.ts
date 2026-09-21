import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

interface MenuItem {
  labelKey: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly language = inject(LanguageService);
  private readonly router = inject(Router);

  readonly initials = computed(() => (this.auth.username() ?? '?').slice(0, 2));

  readonly menu: MenuItem[] = [
    { labelKey: 'nav.dashboard', route: '/dashboard', icon: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z' },
    {
      labelKey: 'nav.employees',
      route: '/employees',
      icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87'
    },
    { labelKey: 'nav.departments', route: '/departments', icon: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4' },
    {
      labelKey: 'nav.attendance',
      route: '/attendance',
      icon: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M16 2v4 M8 2v4 M3 10h18'
    },
    { labelKey: 'nav.payroll', route: '/payroll', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }
  ];

  readonly settingsMenu: MenuItem[] = [
    {
      labelKey: 'nav.salaries',
      route: '/settings/salaries',
      icon: 'M20 12V8H6a2 2 0 0 1 0-4h12v4 M4 6v12a2 2 0 0 0 2 2h14v-4 M18 12a2 2 0 0 0 0 4h4v-4z'
    },
    {
      labelKey: 'nav.serviceIncentives',
      route: '/settings/service-incentives',
      icon: 'M12 2l3 6 6 .9-4.5 4.2 1.1 6.4-5.6-3-5.6 3 1.1-6.4L3 8.9 9 8z'
    },
    {
      labelKey: 'nav.attendanceRules',
      route: '/settings/attendance-rules',
      icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'
    },
    {
      labelKey: 'nav.calculationMode',
      route: '/settings/calculation',
      icon: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M8 7h8 M8 12h3 M13 12h3 M8 16h3 M13 16h3'
    }
  ];

  readonly reportsMenu: MenuItem[] = [
    {
      labelKey: 'nav.attendance',
      route: '/reports/attendance',
      icon: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'
    },
    { labelKey: 'nav.incentivesDeductions', route: '/reports/incentives', icon: 'M3 3v18h18 M18 9l-5 5-3-3-4 4' },
    {
      labelKey: 'nav.employees',
      route: '/reports/employees',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h4'
    },
    { labelKey: 'nav.salaries', route: '/reports/salaries', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }
  ];

  toggleLanguage(): void {
    this.language.toggle();
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
