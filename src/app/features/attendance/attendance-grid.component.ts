import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { CellClickedEvent, ColDef, GetRowIdParams, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AbsenceEntry } from '../../core/models/absence.models';
import { DepartmentLookup } from '../../core/models/payroll.models';
import { AbsenceService } from '../../core/services/absence.service';
import { DepartmentService } from '../../core/services/department.service';
import { LanguageService } from '../../core/services/language.service';
import { ToastService } from '../../core/services/toast.service';
import { payrollGridTheme } from '../../shared/ag-grid/grid-theme';

interface GridRow {
  employeeId: number;
  fullName: string;
}

const DAY_COL_PREFIX = 'day-';

@Component({
  selector: 'app-attendance-grid',
  imports: [FormsModule, TranslatePipe, AgGridAngular],
  templateUrl: './attendance-grid.component.html'
})
export class AttendanceGridComponent implements OnInit, OnDestroy {
  private readonly absenceService = inject(AbsenceService);
  private readonly departmentService = inject(DepartmentService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  readonly language = inject(LanguageService);

  private readonly today = new Date();

  readonly year = signal(this.today.getFullYear());
  readonly month = signal(this.today.getMonth() + 1);
  readonly departmentId = signal<number | null>(null);
  readonly departments = signal<DepartmentLookup[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly isLocked = signal(false);
  readonly rows = signal<GridRow[]>([]);

  private originalSet = new Set<string>();
  readonly pendingSet = signal<Set<string>>(new Set());

  readonly days = computed(() => {
    const daysInMonth = new Date(this.year(), this.month(), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  });

  readonly unsavedCount = computed(() => {
    const original = this.originalSet;
    const pending = this.pendingSet();
    let diff = 0;
    for (const key of pending) if (!original.has(key)) diff++;
    for (const key of original) if (!pending.has(key)) diff++;
    return diff;
  });

  readonly theme = payrollGridTheme;
  readonly defaultColDef: ColDef = { sortable: false, resizable: false };
  readonly colDefs = signal<ColDef<GridRow>[]>([]);

  readonly getRowId = (p: GetRowIdParams<GridRow>) => String(p.data.employeeId);

  private gridApi?: GridApi<GridRow>;
  private readonly langChangeSub = this.translate.onLangChange.subscribe(() => this.colDefs.set(this.buildColDefs()));
  // Column count depends on the month's day count, and the locked cursor style depends
  // on isLocked, so columns must rebuild whenever either changes.
  private readonly rebuildOnDaysChange = effect(() => {
    const days = this.days();
    this.isLocked();
    this.colDefs.set(this.buildColDefs(days));
  });

  ngOnInit(): void {
    this.departmentService.getLookup().subscribe((res) => this.departments.set(res.object ?? []));
    this.load();
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
  }

  onGridReady(event: GridReadyEvent<GridRow>): void {
    this.gridApi = event.api;
  }

  onCellClicked(event: CellClickedEvent<GridRow>): void {
    const colId = event.column.getColId();
    if (!colId.startsWith(DAY_COL_PREFIX) || !event.data) return;

    const day = Number(colId.slice(DAY_COL_PREFIX.length));
    this.toggle(event.data.employeeId, day);
    event.api.refreshCells({ rowNodes: [event.node!], columns: [colId], force: true });
  }

  load(): void {
    this.loading.set(true);
    this.absenceService.getMonthGrid(this.year(), this.month(), this.departmentId()).subscribe((res) => {
      this.loading.set(false);
      const grid = res.object;
      if (!grid) return;

      this.isLocked.set(grid.isLocked);
      this.rows.set(grid.employees.map((e) => ({ employeeId: e.employeeId, fullName: e.fullName })));

      const set = new Set<string>();
      for (const e of grid.employees) {
        for (const date of e.absenceDates) {
          set.add(this.key(e.employeeId, date.substring(0, 10)));
        }
      }
      this.originalSet = set;
      this.pendingSet.set(new Set(set));
    });
  }

  changePeriod(): void {
    this.load();
  }

  isMarked(employeeId: number, day: number): boolean {
    return this.pendingSet().has(this.key(employeeId, this.dateFor(day)));
  }

  toggle(employeeId: number, day: number): void {
    if (this.isLocked()) return;

    const key = this.key(employeeId, this.dateFor(day));
    const next = new Set(this.pendingSet());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.pendingSet.set(next);
  }

  save(): void {
    const add: AbsenceEntry[] = [];
    const remove: AbsenceEntry[] = [];
    const pending = this.pendingSet();

    for (const key of pending) {
      if (!this.originalSet.has(key)) add.push(this.toEntry(key));
    }
    for (const key of this.originalSet) {
      if (!pending.has(key)) remove.push(this.toEntry(key));
    }

    if (add.length === 0 && remove.length === 0) return;

    this.saving.set(true);
    this.absenceService.applyBatch({ add, remove }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.object) {
          this.toast.success(this.translate.instant('attendance.saved'));
          this.load();
        }
      },
      error: () => this.saving.set(false)
    });
  }

  discard(): void {
    this.pendingSet.set(new Set(this.originalSet));
    // Day-cell values come from a valueGetter reading `pendingSet`, which ag-grid doesn't
    // know is reactive — without this, resetting the signal leaves stale colored squares
    // on screen until something else forces a redraw.
    this.gridApi?.refreshCells({ force: true });
  }

  private dateFor(day: number): string {
    return `${this.year()}-${String(this.month()).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  private key(employeeId: number, date: string): string {
    return `${employeeId}_${date}`;
  }

  private toEntry(key: string): AbsenceEntry {
    const [employeeId, date] = key.split('_');
    return { employeeId: Number(employeeId), date };
  }

  private buildColDefs(days: number[] = this.days()): ColDef<GridRow>[] {
    const t = (key: string) => this.translate.instant(key);
    const dayCols: ColDef<GridRow>[] = days.map((day) => ({
      colId: `${DAY_COL_PREFIX}${day}`,
      headerName: String(day),
      width: 48,
      valueGetter: (p) => (p.data ? this.isMarked(p.data.employeeId, day) : false),
      cellRenderer: (p: { value: boolean }) => this.dayCellHtml(p.value),
      // The theme's 14px horizontal cell padding would leave less room than the 18px
      // square needs, and ag-grid would truncate it to an ellipsis — so pad these cells 0.
      cellStyle: { textAlign: 'center', padding: 0, cursor: this.isLocked() ? 'default' : 'pointer' }
    }));

    return [
      { field: 'fullName', headerName: t('common.employee'), pinned: 'left', width: 200 },
      ...dayCols
    ];
  }

  private dayCellHtml(marked: boolean): string {
    return marked
      ? '<span style="display:inline-block;width:18px;height:18px;border-radius:4px;background:var(--color-danger);"></span>'
      : '<span style="display:inline-block;width:18px;height:18px;border-radius:4px;border:1px solid var(--color-border);"></span>';
  }
}
