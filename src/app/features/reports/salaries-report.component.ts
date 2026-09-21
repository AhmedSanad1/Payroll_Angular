import { formatNumber } from '@angular/common';
import { Component, LOCALE_ID, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { DepartmentLookup } from '../../core/models/payroll.models';
import { PayrollRunListItem } from '../../core/models/payroll-run.models';
import { SalaryReportRow } from '../../core/models/report.models';
import { DepartmentService } from '../../core/services/department.service';
import { LanguageService } from '../../core/services/language.service';
import { PayrollRunService } from '../../core/services/payroll-run.service';
import { ReportService } from '../../core/services/report.service';
import { payrollGridTheme } from '../../shared/ag-grid/grid-theme';
import { wireGridPrintMode } from '../../shared/ag-grid/grid-print';
import { openPdf } from '../../shared/files/open-pdf';

@Component({
  selector: 'app-salaries-report',
  imports: [FormsModule, TranslatePipe, AgGridAngular],
  templateUrl: './salaries-report.component.html'
})
export class SalariesReportComponent implements OnInit, OnDestroy {
  private readonly reportService = inject(ReportService);
  private readonly departmentService = inject(DepartmentService);
  private readonly payrollRunService = inject(PayrollRunService);
  private readonly translate = inject(TranslateService);
  private readonly locale = inject(LOCALE_ID);
  readonly language = inject(LanguageService);

  readonly runs = signal<PayrollRunListItem[]>([]);
  readonly departments = signal<DepartmentLookup[]>([]);
  readonly runId = signal<number | null>(null);
  readonly departmentId = signal<number | null>(null);

  readonly rows = signal<SalaryReportRow[]>([]);
  readonly loading = signal(false);
  readonly exportingPdf = signal(false);

  readonly theme = payrollGridTheme;
  readonly defaultColDef: ColDef = { sortable: true, resizable: true, flex: 1, minWidth: 120 };
  readonly colDefs = signal<ColDef<SalaryReportRow>[]>([]);

  private gridApi?: GridApi<SalaryReportRow>;
  private readonly langChangeSub = this.translate.onLangChange.subscribe(() => this.colDefs.set(this.buildColDefs()));
  private unwirePrint?: () => void;

  ngOnInit(): void {
    this.colDefs.set(this.buildColDefs());
    this.departmentService.getLookup().subscribe((res) => this.departments.set(res.object ?? []));
    this.payrollRunService.getPaged(1, 24).subscribe((res) => {
      const items = res.object?.items ?? [];
      this.runs.set(items);
      if (items.length > 0) {
        this.runId.set(items[0].id);
        this.load();
      }
    });
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
    this.unwirePrint?.();
  }

  onGridReady(event: GridReadyEvent<SalaryReportRow>): void {
    this.gridApi = event.api;
    this.unwirePrint = wireGridPrintMode(() => this.gridApi);
  }

  load(): void {
    const runId = this.runId();
    if (!runId) return;

    this.loading.set(true);
    this.reportService.getSalariesReport(runId, this.departmentId()).subscribe((res) => {
      this.loading.set(false);
      this.rows.set(res.object ?? []);
    });
  }

  print(): void {
    window.print();
  }

  exportPdf(): void {
    const runId = this.runId();
    if (!runId) return;

    this.exportingPdf.set(true);
    this.reportService.getSalariesReportPdf(runId, this.departmentId()).subscribe({
      next: (pdf) => {
        this.exportingPdf.set(false);
        openPdf(pdf, `SalariesReport_${runId}.pdf`);
      },
      error: () => this.exportingPdf.set(false)
    });
  }

  private buildColDefs(): ColDef<SalaryReportRow>[] {
    const t = (key: string) => this.translate.instant(key);
    const money = (v: number) => formatNumber(v ?? 0, this.locale, '1.2-2');
    return [
      { field: 'employeeName', headerName: t('common.employee') },
      { field: 'departmentName', headerName: t('common.department') },
      { field: 'baseSalary', headerName: t('common.baseSalary'), valueFormatter: (p) => money(p.value) },
      { field: 'netSalary', headerName: t('common.netSalary'), valueFormatter: (p) => money(p.value) }
    ];
  }
}
