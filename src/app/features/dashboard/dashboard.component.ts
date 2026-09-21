import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import type { ApexAxisChartSeries, ApexChart, ApexXAxis } from 'ng-apexcharts';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { EmployeeService } from '../../core/services/employee.service';
import { PayrollRunService } from '../../core/services/payroll-run.service';
import { ReportService } from '../../core/services/report.service';
import { PayrollRunStatus } from '../../core/models/payroll-run.models';

@Component({
  selector: 'app-dashboard',
  imports: [NgApexchartsModule, DecimalPipe, TranslatePipe],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly payrollRunService = inject(PayrollRunService);
  private readonly reportService = inject(ReportService);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly employeeCount = signal(0);
  readonly lastApprovedRunTotal = signal<number | null>(null);
  readonly lastApprovedRunLabel = signal<string | null>(null);
  readonly absentDaysThisMonth = signal(0);

  readonly chartSeries = signal<ApexAxisChartSeries>([{ name: this.translate.instant('common.netSalary'), data: [] }]);
  readonly chartLabels = signal<string[]>([]);
  readonly chart: ApexChart = { type: 'bar', height: 320, toolbar: { show: false } };

  ngOnInit(): void {
    const today = new Date();

    forkJoin({
      employees: this.employeeService.getPaged({ pageNumber: 1, pageSize: 1 }),
      runs: this.payrollRunService.getPaged(1, 12),
      attendance: this.reportService.getAttendanceReport(today.getFullYear(), today.getMonth() + 1)
    }).subscribe(({ employees, runs, attendance }) => {
      this.employeeCount.set(employees.object?.totalCount ?? 0);

      const absentTotal = (attendance.object ?? []).reduce((sum, row) => sum + row.absentDays, 0);
      this.absentDaysThisMonth.set(absentTotal);

      const lastApproved = (runs.object?.items ?? []).find((r) => r.status === PayrollRunStatus.Approved);
      if (lastApproved) {
        this.lastApprovedRunTotal.set(lastApproved.totalNetSalary);
        this.lastApprovedRunLabel.set(`${lastApproved.periodYear}-${String(lastApproved.periodMonth).padStart(2, '0')}`);

        this.reportService.getSalariesReport(lastApproved.id).subscribe((salaries) => {
          const byDept = new Map<string, number>();
          for (const row of salaries.object ?? []) {
            byDept.set(row.departmentName, (byDept.get(row.departmentName) ?? 0) + row.netSalary);
          }
          this.chartLabels.set([...byDept.keys()]);
          this.chartSeries.set([{ name: this.translate.instant('common.netSalary'), data: [...byDept.values()] }]);
          this.loading.set(false);
        });
      } else {
        this.loading.set(false);
      }
    });
  }

  get xaxis(): ApexXAxis {
    return { categories: this.chartLabels() };
  }
}
