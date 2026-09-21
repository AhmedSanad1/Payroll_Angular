import { formatNumber } from '@angular/common';
import { Component, LOCALE_ID, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { CellValueChangedEvent, ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { JobGrade } from '../../core/models/payroll.models';
import { JobGradeService } from '../../core/services/job-grade.service';
import { LanguageService } from '../../core/services/language.service';
import { ToastService } from '../../core/services/toast.service';
import { payrollGridTheme } from '../../shared/ag-grid/grid-theme';

@Component({
  selector: 'app-salaries',
  imports: [TranslatePipe, AgGridAngular],
  templateUrl: './salaries.component.html'
})
export class SalariesComponent implements OnInit, OnDestroy {
  private readonly jobGradeService = inject(JobGradeService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly locale = inject(LOCALE_ID);
  readonly language = inject(LanguageService);

  readonly grades = signal<JobGrade[]>([]);
  readonly loading = signal(true);

  readonly theme = payrollGridTheme;
  readonly defaultColDef: ColDef = { sortable: true, resizable: true, flex: 1, minWidth: 120 };
  readonly colDefs = signal<ColDef<JobGrade>[]>([]);

  private gridApi?: GridApi<JobGrade>;
  private readonly langChangeSub = this.translate.onLangChange.subscribe(() => this.colDefs.set(this.buildColDefs()));

  ngOnInit(): void {
    this.colDefs.set(this.buildColDefs());
    this.load();
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
  }

  onGridReady(event: GridReadyEvent<JobGrade>): void {
    this.gridApi = event.api;
  }

  load(): void {
    this.loading.set(true);
    this.jobGradeService.getAll().subscribe((res) => {
      this.loading.set(false);
      this.grades.set(res.object ?? []);
    });
  }

  // Cells are editable in place; each edit auto-saves immediately (double-click or Enter
  // to start editing, matching ag-grid's default), replacing the old row-level edit/save/cancel toggle.
  onCellValueChanged(event: CellValueChangedEvent<JobGrade>): void {
    const grade = event.data;
    this.jobGradeService.update(grade.id, grade).subscribe({
      next: (res) => {
        if (res.object) {
          this.toast.success(this.translate.instant('settings.salaries.updated'));
        }
      },
      error: () => this.load()
    });
  }

  private buildColDefs(): ColDef<JobGrade>[] {
    const t = (key: string) => this.translate.instant(key);
    return [
      { field: 'nameEn', headerName: t('settings.salaries.nameEn'), editable: true },
      { field: 'nameAr', headerName: t('settings.salaries.nameAr'), editable: true },
      {
        field: 'baseSalary',
        headerName: t('common.baseSalary'),
        editable: true,
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: { precision: 2, min: 0 },
        valueFormatter: (p) => formatNumber(p.value ?? 0, this.locale, '1.2-2')
      }
    ];
  }
}
