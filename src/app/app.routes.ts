import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/employees/employee-list/employee-list.component').then((m) => m.EmployeeListComponent)
      },
      {
        path: 'employees/new',
        loadComponent: () =>
          import('./features/employees/employee-form/employee-form.component').then((m) => m.EmployeeFormComponent)
      },
      {
        path: 'employees/:id',
        loadComponent: () =>
          import('./features/employees/employee-form/employee-form.component').then((m) => m.EmployeeFormComponent)
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./features/departments/department-list.component').then((m) => m.DepartmentListComponent)
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./features/attendance/attendance-grid.component').then((m) => m.AttendanceGridComponent)
      },
      {
        path: 'payroll',
        loadComponent: () =>
          import('./features/payroll/payroll-run-list/payroll-run-list.component').then((m) => m.PayrollRunListComponent)
      },
      {
        path: 'payroll/:id',
        loadComponent: () =>
          import('./features/payroll/payroll-run-detail/payroll-run-detail.component').then(
            (m) => m.PayrollRunDetailComponent
          )
      },
      {
        path: 'settings/salaries',
        loadComponent: () => import('./features/settings/salaries.component').then((m) => m.SalariesComponent)
      },
      {
        path: 'settings/service-incentives',
        loadComponent: () =>
          import('./features/settings/service-incentives.component').then((m) => m.ServiceIncentivesComponent)
      },
      {
        path: 'settings/attendance-rules',
        loadComponent: () =>
          import('./features/settings/attendance-rules-settings.component').then((m) => m.AttendanceRulesSettingsComponent)
      },
      {
        path: 'settings/calculation',
        loadComponent: () => import('./features/settings/calculation.component').then((m) => m.CalculationComponent)
      },
      {
        path: 'reports/attendance',
        loadComponent: () =>
          import('./features/reports/attendance-report.component').then((m) => m.AttendanceReportComponent)
      },
      {
        path: 'reports/incentives',
        loadComponent: () =>
          import('./features/reports/incentives-report.component').then((m) => m.IncentivesReportComponent)
      },
      {
        path: 'reports/employees',
        loadComponent: () =>
          import('./features/reports/employees-report.component').then((m) => m.EmployeesReportComponent)
      },
      {
        path: 'reports/salaries',
        loadComponent: () =>
          import('./features/reports/salaries-report.component').then((m) => m.SalariesReportComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
