import { DecimalPipe, formatNumber } from '@angular/common';
import { Component, LOCALE_ID, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AttendanceAdjustmentType, DepartmentLookup } from '../../../core/models/payroll.models';
import { PayrollItem, PayrollRunDetail, PayrollRunStatus } from '../../../core/models/payroll-run.models';
import { DepartmentService } from '../../../core/services/department.service';
import { LanguageService } from '../../../core/services/language.service';
import { PayrollRunService } from '../../../core/services/payroll-run.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { payrollGridTheme } from '../../../shared/ag-grid/grid-theme';
import { RowActionsCellRendererComponent } from '../../../shared/ag-grid/row-actions-cell-renderer.component';

@Component({
  selector: 'app-payroll-run-detail',
  imports: [FormsModule, RouterLink, DecimalPipe, PaginationComponent, TranslatePipe, AgGridAngular],
  templateUrl: './payroll-run-detail.component.html'
})
export class PayrollRunDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(PayrollRunService);
  private readonly departmentService = inject(DepartmentService);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  private readonly locale = inject(LOCALE_ID);
  readonly language = inject(LanguageService);

  readonly PayrollRunStatus = PayrollRunStatus;
  readonly AttendanceAdjustmentType = AttendanceAdjustmentType;

  readonly runId = Number(this.route.snapshot.paramMap.get('id'));
  readonly run = signal<PayrollRunDetail | null>(null);
  readonly loading = signal(true);
  readonly approving = signal(false);

  readonly departments = signal<DepartmentLookup[]>([]);
  readonly departmentId = signal<number | null>(null);
  readonly search = signal('');

  readonly items = signal<PayrollItem[]>([]);
  readonly itemsLoading = signal(true);
  readonly pageNumber = signal(1);
  readonly pageSize = 20;
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);
  readonly hasPreviousPage = signal(false);
  readonly hasNextPage = signal(false);

  readonly selectedItem = signal<PayrollItem | null>(null);

  readonly theme = payrollGridTheme;
  readonly defaultColDef: ColDef = { sortable: true, resizable: true, flex: 1, minWidth: 120 };
  readonly colDefs = signal<ColDef<PayrollItem>[]>([]);

  private gridApi?: GridApi<PayrollItem>;
  private readonly langChangeSub = this.translate.onLangChange.subscribe(() => this.colDefs.set(this.buildColDefs()));

  ngOnInit(): void {
    this.colDefs.set(this.buildColDefs());
    this.departmentService.getLookup().subscribe((res) => this.departments.set(res.object ?? []));
    this.loadRun();
    this.loadItems();
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
  }

  onGridReady(event: GridReadyEvent<PayrollItem>): void {
    this.gridApi = event.api;
  }

  loadRun(): void {
    this.loading.set(true);
    this.service.getById(this.runId).subscribe((res) => {
      this.loading.set(false);
      if (res.object) this.run.set(res.object);
    });
  }

  loadItems(): void {
    this.itemsLoading.set(true);
    this.service
      .getItems(this.runId, this.pageNumber(), this.pageSize, this.departmentId(), this.search() || undefined)
      .subscribe((res) => {
        this.itemsLoading.set(false);
        const page = res.object;
        if (!page) return;
        this.items.set(page.items);
        this.totalCount.set(page.totalCount);
        this.totalPages.set(page.totalPages);
        this.hasPreviousPage.set(page.hasPreviousPage);
        this.hasNextPage.set(page.hasNextPage);
      });
  }

  applyFilters(): void {
    this.pageNumber.set(1);
    this.loadItems();
  }

  goToPage(page: number): void {
    this.pageNumber.set(page);
    this.loadItems();
  }

  openBreakdown(item: PayrollItem): void {
    this.selectedItem.set(item);
  }

  closeBreakdown(): void {
    this.selectedItem.set(null);
  }

  async approve(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: this.translate.instant('payroll.approveTitle'),
      message: this.translate.instant('payroll.approveMessage'),
      confirmText: this.translate.instant('payroll.approve')
    });
    if (!confirmed) return;

    this.approving.set(true);
    this.service.approve(this.runId).subscribe({
      next: (res) => {
        this.approving.set(false);
        if (res.object) {
          this.toast.success(this.translate.instant('payroll.approved'));
          this.run.set(res.object);
        }
      },
      error: () => this.approving.set(false)
    });
  }

  private buildColDefs(): ColDef<PayrollItem>[] {
    const t = (key: string) => this.translate.instant(key);
    const money = (v: number) => formatNumber(v ?? 0, this.locale, '1.2-2');
    return [
      { field: 'employeeName', headerName: t('common.employee') },
      { field: 'departmentName', headerName: t('common.department') },
      { field: 'gradeName', headerName: t('common.grade') },
      { field: 'baseSalary', headerName: t('common.baseSalary'), valueFormatter: (p) => money(p.value) },
      { field: 'netSalary', headerName: t('common.netSalary'), valueFormatter: (p) => money(p.value) },
      {
        headerName: '',
        flex: 0,
        width: 150,
        sortable: false,
        resizable: false,
        cellRenderer: RowActionsCellRendererComponent,
        cellRendererParams: {
          actions: [{ label: t('payroll.breakdown'), onClick: (row: PayrollItem) => this.openBreakdown(row) }]
        }
      }
    ];
  }
}
