import { formatDate } from '@angular/common';
import { Component, LOCALE_ID, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { DepartmentLookup, JobGrade } from '../../core/models/payroll.models';
import { EmployeeReportRow } from '../../core/models/report.models';
import { DepartmentService } from '../../core/services/department.service';
import { JobGradeService } from '../../core/services/job-grade.service';
import { LanguageService } from '../../core/services/language.service';
import { ReportService } from '../../core/services/report.service';
import { payrollGridTheme } from '../../shared/ag-grid/grid-theme';
import { wireGridPrintMode } from '../../shared/ag-grid/grid-print';
import { openPdf } from '../../shared/files/open-pdf';

@Component({
  selector: 'app-employees-report',
  imports: [FormsModule, TranslatePipe, AgGridAngular],
  templateUrl: './employees-report.component.html'
})
export class EmployeesReportComponent implements OnInit, OnDestroy {
  private readonly reportService = inject(ReportService);
  private readonly departmentService = inject(DepartmentService);
  private readonly jobGradeService = inject(JobGradeService);
  private readonly translate = inject(TranslateService);
  private readonly locale = inject(LOCALE_ID);
  readonly language = inject(LanguageService);

  readonly departments = signal<DepartmentLookup[]>([]);
  readonly jobGrades = signal<JobGrade[]>([]);
  readonly departmentId = signal<number | null>(null);
  readonly jobGradeId = signal<number | null>(null);

  readonly rows = signal<EmployeeReportRow[]>([]);
  readonly loading = signal(true);
  readonly exportingPdf = signal(false);

  readonly theme = payrollGridTheme;
  readonly defaultColDef: ColDef = { sortable: true, resizable: true, flex: 1, minWidth: 120 };
  readonly colDefs = signal<ColDef<EmployeeReportRow>[]>([]);

  private gridApi?: GridApi<EmployeeReportRow>;
  private readonly langChangeSub = this.translate.onLangChange.subscribe(() => this.colDefs.set(this.buildColDefs()));
  private unwirePrint?: () => void;

  ngOnInit(): void {
    this.colDefs.set(this.buildColDefs());
    this.departmentService.getLookup().subscribe((res) => this.departments.set(res.object ?? []));
    this.jobGradeService.getAll().subscribe((res) => this.jobGrades.set(res.object ?? []));
    this.load();
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
    this.unwirePrint?.();
  }

  onGridReady(event: GridReadyEvent<EmployeeReportRow>): void {
    this.gridApi = event.api;
    this.unwirePrint = wireGridPrintMode(() => this.gridApi);
  }

  load(): void {
    this.loading.set(true);
    this.reportService.getEmployeesReport(this.departmentId(), this.jobGradeId()).subscribe((res) => {
      this.loading.set(false);
      this.rows.set(res.object ?? []);
    });
  }

  print(): void {
    window.print();
  }

  exportPdf(): void {
    this.exportingPdf.set(true);
    this.reportService.getEmployeesReportPdf(this.departmentId(), this.jobGradeId()).subscribe({
      next: (pdf) => {
        this.exportingPdf.set(false);
        openPdf(pdf, 'EmployeesReport.pdf');
      },
      error: () => this.exportingPdf.set(false)
    });
  }

  private buildColDefs(): ColDef<EmployeeReportRow>[] {
    const t = (key: string) => this.translate.instant(key);
    return [
      { field: 'fullName', headerName: t('common.name') },
      { field: 'email', headerName: t('common.email') },
      { field: 'departmentName', headerName: t('common.department') },
      { field: 'gradeName', headerName: t('common.grade') },
      {
        field: 'hireDate',
        headerName: t('common.hireDate'),
        valueFormatter: (p) => (p.value ? formatDate(p.value, 'yyyy-MM-dd', this.locale) : '')
      }
    ];
  }
}
