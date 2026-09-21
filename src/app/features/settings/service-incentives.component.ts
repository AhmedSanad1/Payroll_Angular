import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { ServiceIncentiveTier } from '../../core/models/payroll.models';
import { LanguageService } from '../../core/services/language.service';
import { ServiceIncentiveTierService } from '../../core/services/service-incentive-tier.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { payrollGridTheme } from '../../shared/ag-grid/grid-theme';
import { RowActionsCellRendererComponent } from '../../shared/ag-grid/row-actions-cell-renderer.component';

@Component({
  selector: 'app-service-incentives',
  imports: [ReactiveFormsModule, TranslatePipe, AgGridAngular],
  templateUrl: './service-incentives.component.html'
})
export class ServiceIncentivesComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ServiceIncentiveTierService);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  readonly language = inject(LanguageService);

  readonly tiers = signal<ServiceIncentiveTier[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialogOpen = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    minYearsExceeded: [0, [Validators.required, Validators.min(0)]],
    percent: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  readonly theme = payrollGridTheme;
  readonly defaultColDef: ColDef = { sortable: true, resizable: true, flex: 1, minWidth: 120 };
  readonly colDefs = signal<ColDef<ServiceIncentiveTier>[]>([]);

  private gridApi?: GridApi<ServiceIncentiveTier>;
  private readonly langChangeSub = this.translate.onLangChange.subscribe(() => this.colDefs.set(this.buildColDefs()));

  ngOnInit(): void {
    this.colDefs.set(this.buildColDefs());
    this.load();
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
  }

  onGridReady(event: GridReadyEvent<ServiceIncentiveTier>): void {
    this.gridApi = event.api;
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe((res) => {
      this.loading.set(false);
      this.tiers.set((res.object ?? []).sort((a, b) => a.minYearsExceeded - b.minYearsExceeded));
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ minYearsExceeded: 0, percent: 0 });
    this.dialogOpen.set(true);
  }

  openEdit(tier: ServiceIncentiveTier): void {
    this.editingId.set(tier.id);
    this.form.reset({ minYearsExceeded: tier.minYearsExceeded, percent: tier.percent });
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
          this.toast.success(this.translate.instant(id ? 'settings.tiers.updated' : 'settings.tiers.created'));
          this.dialogOpen.set(false);
          this.load();
        }
      },
      error: () => this.saving.set(false)
    });
  }

  async remove(tier: ServiceIncentiveTier): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: this.translate.instant('settings.tiers.deleteTitle'),
      message: this.translate.instant('settings.tiers.deleteMessage', { years: tier.minYearsExceeded }),
      confirmText: this.translate.instant('common.delete'),
      danger: true
    });
    if (!confirmed) return;

    this.service.delete(tier.id).subscribe((res) => {
      if (res.object) {
        this.toast.success(this.translate.instant('settings.tiers.deleted'));
        this.load();
      }
    });
  }

  private buildColDefs(): ColDef<ServiceIncentiveTier>[] {
    const t = (key: string, params?: object) => this.translate.instant(key, params);
    return [
      {
        headerName: t('settings.tiers.yearsExceeded'),
        valueGetter: (p) => t('settings.tiers.moreThanYears', { years: p.data!.minYearsExceeded })
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
            { label: t('common.edit'), onClick: (row: ServiceIncentiveTier) => this.openEdit(row) },
            { label: t('common.delete'), variant: 'danger', onClick: (row: ServiceIncentiveTier) => this.remove(row) }
          ]
        }
      }
    ];
  }
}
