import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Department } from '../../core/models/payroll.models';
import { DepartmentService } from '../../core/services/department.service';
import { LanguageService } from '../../core/services/language.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { payrollGridTheme } from '../../shared/ag-grid/grid-theme';
import { RowActionsCellRendererComponent } from '../../shared/ag-grid/row-actions-cell-renderer.component';

@Component({
  selector: 'app-department-list',
  imports: [ReactiveFormsModule, PaginationComponent, TranslatePipe, AgGridAngular],
  templateUrl: './department-list.component.html'
})
export class DepartmentListComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  readonly language = inject(LanguageService);

  readonly items = signal<Department[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly pageNumber = signal(1);
  readonly pageSize = 20;
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);
  readonly hasPreviousPage = signal(false);
  readonly hasNextPage = signal(false);

  readonly dialogOpen = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    incentivePercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  readonly theme = payrollGridTheme;
  readonly defaultColDef: ColDef = { sortable: true, resizable: true, flex: 1, minWidth: 120 };
  readonly colDefs = signal<ColDef<Department>[]>([]);

  private gridApi?: GridApi<Department>;
  private readonly langChangeSub = this.translate.onLangChange.subscribe(() => this.colDefs.set(this.buildColDefs()));

  ngOnInit(): void {
    this.colDefs.set(this.buildColDefs());
    this.load();
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
  }

  onGridReady(event: GridReadyEvent<Department>): void {
    this.gridApi = event.api;
  }

  load(): void {
    this.loading.set(true);
    this.departmentService.getPaged(this.pageNumber(), this.pageSize).subscribe((res) => {
      this.loading.set(false);
      const page = res.object;
      if (!page) return;
      this.items.set(page.items);
      this.totalCount.set(page.totalCount);
      this.totalPages.set(page.totalPages);
      this.hasPreviousPage.set(page.hasPreviousPage);
      this.hasNextPage.set(page.hasNextPage);
    });
  }

  goToPage(page: number): void {
    this.pageNumber.set(page);
    this.load();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', incentivePercent: 0 });
    this.dialogOpen.set(true);
  }

  openEdit(department: Department): void {
    this.editingId.set(department.id);
    this.form.reset({ name: department.name, incentivePercent: department.incentivePercent });
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

    const request$ = id ? this.departmentService.update(id, { id, ...value }) : this.departmentService.create(value);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.object) {
          this.toast.success(this.translate.instant(id ? 'departments.updated' : 'departments.created'));
          this.dialogOpen.set(false);
          this.load();
        }
      },
      error: () => this.saving.set(false)
    });
  }

  async remove(department: Department): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: this.translate.instant('departments.deleteTitle'),
      message: this.translate.instant('departments.deleteMessage', { name: department.name }),
      confirmText: this.translate.instant('common.delete'),
      danger: true
    });
    if (!confirmed) return;

    this.departmentService.delete(department.id).subscribe((res) => {
      if (res.object) {
        this.toast.success(this.translate.instant('departments.deleted'));
        this.load();
      }
    });
  }

  private buildColDefs(): ColDef<Department>[] {
    const t = (key: string) => this.translate.instant(key);
    return [
      { field: 'name', headerName: t('common.name') },
      {
        field: 'incentivePercent',
        headerName: t('departments.incentivePercent'),
        valueFormatter: (p) => `${p.value}%`
      },
      {
        headerName: '',
        flex: 0,
        width: 170,
        sortable: false,
        resizable: false,
        cellRenderer: RowActionsCellRendererComponent,
        cellRendererParams: {
          actions: [
            { label: t('common.edit'), onClick: (row: Department) => this.openEdit(row) },
            { label: t('common.delete'), variant: 'danger', onClick: (row: Department) => this.remove(row) }
          ]
        }
      }
    ];
  }
}
