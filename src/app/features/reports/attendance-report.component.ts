import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { DepartmentLookup } from '../../core/models/payroll.models';
import { AttendanceReportRow } from '../../core/models/report.models';
import { DepartmentService } from '../../core/services/department.service';
import { LanguageService } from '../../core/services/language.service';
import { ReportService } from '../../core/services/report.service';
import { payrollGridTheme } from '../../shared/ag-grid/grid-theme';
import { wireGridPrintMode } from '../../shared/ag-grid/grid-print';
import { openPdf } from '../../shared/files/open-pdf';

@Component({
  selector: 'app-attendance-report',
  imports: [FormsModule, TranslatePipe, AgGridAngular],
  templateUrl: './attendance-report.component.html'
})
export class AttendanceReportComponent implements OnInit, OnDestroy {
  private readonly reportService = inject(ReportService);
  private readonly departmentService = inject(DepartmentService);
  private readonly translate = inject(TranslateService);
  readonly language = inject(LanguageService);

  private readonly today = new Date();
  readonly year = signal(this.today.getFullYear());
  readonly month = signal(this.today.getMonth() + 1);
  readonly departmentId = signal<number | null>(null);
  readonly departments = signal<DepartmentLookup[]>([]);

  readonly rows = signal<AttendanceReportRow[]>([]);
  readonly loading = signal(true);
  readonly exportingPdf = signal(false);

  readonly theme = payrollGridTheme;
  readonly defaultColDef: ColDef = { sortable: true, resizable: true, flex: 1, minWidth: 120 };
  readonly colDefs = signal<ColDef<AttendanceReportRow>[]>([]);

  private gridApi?: GridApi<AttendanceReportRow>;
  private readonly langChangeSub = this.translate.onLangChange.subscribe(() => this.colDefs.set(this.buildColDefs()));
  private unwirePrint?: () => void;

  ngOnInit(): void {
    this.colDefs.set(this.buildColDefs());
    this.departmentService.getLookup().subscribe((res) => this.departments.set(res.object ?? []));
    this.load();
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
    this.unwirePrint?.();
  }

  onGridReady(event: GridReadyEvent<AttendanceReportRow>): void {
    this.gridApi = event.api;
    this.unwirePrint = wireGridPrintMode(() => this.gridApi);
  }

  load(): void {
    this.loading.set(true);
    this.reportService.getAttendanceReport(this.year(), this.month(), this.departmentId()).subscribe((res) => {
      this.loading.set(false);
      this.rows.set(res.object ?? []);
    });
  }

  print(): void {
    window.print();
  }

  exportPdf(): void {
    const year = this.year();
    const month = this.month();
    this.exportingPdf.set(true);
    this.reportService.getAttendanceReportPdf(year, month, this.departmentId()).subscribe({
      next: (pdf) => {
        this.exportingPdf.set(false);
        openPdf(pdf, `AttendanceReport_${year}-${String(month).padStart(2, '0')}.pdf`);
      },
      error: () => this.exportingPdf.set(false)
    });
  }

  private buildColDefs(): ColDef<AttendanceReportRow>[] {
    const t = (key: string) => this.translate.instant(key);
    return [
      { field: 'fullName', headerName: t('common.employee') },
      { field: 'departmentName', headerName: t('common.department') },
      { field: 'absentDays', headerName: t('reports.absentDays') }
    ];
  }
}
