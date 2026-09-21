import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AttendanceAdjustmentType, AttendanceRule } from '../../core/models/payroll.models';
import { AttendanceRuleService } from '../../core/services/attendance-rule.service';
import { LanguageService } from '../../core/services/language.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { payrollGridTheme } from '../../shared/ag-grid/grid-theme';
import { badgeHtml } from '../../shared/ag-grid/badge-cell-renderer';
import { RowActionsCellRendererComponent } from '../../shared/ag-grid/row-actions-cell-renderer.component';

@Component({
  selector: 'app-attendance-rules-settings',
  imports: [ReactiveFormsModule, TranslatePipe, AgGridAngular],
  templateUrl: './attendance-rules-settings.component.html'
})
export class AttendanceRulesSettingsComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AttendanceRuleService);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  readonly language = inject(LanguageService);

  readonly AttendanceAdjustmentType = AttendanceAdjustmentType;

  readonly rules = signal<AttendanceRule[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialogOpen = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    fromDays: [0, [Validators.required, Validators.min(0)]],
    toDays: this.fb.control<number | null>(null),
    adjustmentType: [AttendanceAdjustmentType.Deduction, Validators.required],
    percent: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  readonly theme = payrollGridTheme;
  readonly defaultColDef: ColDef = { sortable: true, resizable: true, flex: 1, minWidth: 120 };
  readonly colDefs = signal<ColDef<AttendanceRule>[]>([]);

  private gridApi?: GridApi<AttendanceRule>;
  private readonly langChangeSub = this.translate.onLangChange.subscribe(() => this.colDefs.set(this.buildColDefs()));

  ngOnInit(): void {
    this.colDefs.set(this.buildColDefs());
    this.load();
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
  }

  onGridReady(event: GridReadyEvent<AttendanceRule>): void {
    this.gridApi = event.api;
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe((res) => {
      this.loading.set(false);
      this.rules.set((res.object ?? []).sort((a, b) => a.fromDays - b.fromDays));
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ fromDays: 0, toDays: null, adjustmentType: AttendanceAdjustmentType.Deduction, percent: 0 });
    this.dialogOpen.set(true);
  }

  openEdit(rule: AttendanceRule): void {
    this.editingId.set(rule.id);
    this.form.reset({
      fromDays: rule.fromDays,
      toDays: rule.toDays,
      adjustmentType: rule.adjustmentType,
      percent: rule.percent
    });
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();
    const id = this.editingId();

    const request$ = id ? this.service.update(id, { id, ...value }) : this.service.create(value);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.object) {
          this.toast.success(this.translate.instant(id ? 'settings.rules.updated' : 'settings.rules.created'));
          this.dialogOpen.set(false);
          this.load();
        }
      },
      error: () => this.saving.set(false)
    });
  }

  async remove(rule: AttendanceRule): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: this.translate.instant('settings.rules.deleteTitle'),
      message: this.translate.instant('settings.rules.deleteMessage', { range: `${rule.fromDays}-${rule.toDays ?? '∞'}` }),
      confirmText: this.translate.instant('common.delete'),
      danger: true
    });
    if (!confirmed) return;

    this.service.delete(rule.id).subscribe((res) => {
      if (res.object) {
        this.toast.success(this.translate.instant('settings.rules.deleted'));
        this.load();
      }
    });
  }

  private buildColDefs(): ColDef<AttendanceRule>[] {
    const t = (key: string) => this.translate.instant(key);
    return [
      { field: 'fromDays', headerName: t('settings.rules.fromDays') },
      { field: 'toDays', headerName: t('settings.rules.toDays'), valueFormatter: (p) => (p.value ?? '∞').toString() },
      {
        field: 'adjustmentType',
        headerName: t('common.type'),
        cellRenderer: (p: { value: AttendanceAdjustmentType }) =>
          p.value === AttendanceAdjustmentType.Bonus
            ? badgeHtml(t('common.bonus'), 'badge-bonus')
            : badgeHtml(t('common.deduction'), 'badge-deduction')
      },
      { field: 'percent', headerName: t('common.percent'), valueFormatter: (p) => `${p.value}%` },
      {
        headerName: '',
        flex: 0,
        width: 170,
        sortable: false,
        resizable: false,
        cellRenderer: RowActionsCellRendererComponent,
        cellRendererParams: {
          actions: [
            { label: t('common.edit'), onClick: (row: AttendanceRule) => this.openEdit(row) },
            { label: t('common.delete'), variant: 'danger', onClick: (row: AttendanceRule) => this.remove(row) }
          ]
        }
      }
    ];
  }
}
