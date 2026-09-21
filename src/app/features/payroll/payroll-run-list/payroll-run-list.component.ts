import { formatNumber } from '@angular/common';
import { Component, LOCALE_ID, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { PayrollRunListItem, PayrollRunStatus } from '../../../core/models/payroll-run.models';
import { LanguageService } from '../../../core/services/language.service';
import { PayrollRunService } from '../../../core/services/payroll-run.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { payrollGridTheme } from '../../../shared/ag-grid/grid-theme';
import { badgeHtml } from '../../../shared/ag-grid/badge-cell-renderer';
import { RowActionsCellRendererComponent } from '../../../shared/ag-grid/row-actions-cell-renderer.component';

@Component({
  selector: 'app-payroll-run-list',
  imports: [FormsModule, PaginationComponent, TranslatePipe, AgGridAngular],
  templateUrl: './payroll-run-list.component.html'
})
export class PayrollRunListComponent implements OnInit, OnDestroy {
  private readonly service = inject(PayrollRunService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly locale = inject(LOCALE_ID);
  readonly language = inject(LanguageService);

  readonly PayrollRunStatus = PayrollRunStatus;

  private readonly today = new Date();
  readonly generateYear = signal(this.today.getFullYear());
  readonly generateMonth = signal(this.today.getMonth() + 1);
  readonly generating = signal(false);

  readonly items = signal<PayrollRunListItem[]>([]);
  readonly loading = signal(true);

  readonly pageNumber = signal(1);
  readonly pageSize = 12;
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);
  readonly hasPreviousPage = signal(false);
  readonly hasNextPage = signal(false);

  readonly theme = payrollGridTheme;
  readonly defaultColDef: ColDef = { sortable: true, resizable: true, flex: 1, minWidth: 120 };
  readonly colDefs = signal<ColDef<PayrollRunListItem>[]>([]);

  private gridApi?: GridApi<PayrollRunListItem>;
  private readonly langChangeSub = this.translate.onLangChange.subscribe(() => this.colDefs.set(this.buildColDefs()));

  ngOnInit(): void {
    this.colDefs.set(this.buildColDefs());
    this.load();
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
  }

  onGridReady(event: GridReadyEvent<PayrollRunListItem>): void {
    this.gridApi = event.api;
  }

  load(): void {
    this.loading.set(true);
    this.service.getPaged(this.pageNumber(), this.pageSize).subscribe((res) => {
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

  generate(): void {
    this.generating.set(true);
    this.service.generate(this.generateYear(), this.generateMonth()).subscribe({
      next: (res) => {
        this.generating.set(false);
        if (res.object) {
          this.toast.success(this.translate.instant('payroll.generated'));
          this.router.navigate(['/payroll', res.object.id]);
        }
      },
      error: () => this.generating.set(false)
    });
  }

  private buildColDefs(): ColDef<PayrollRunListItem>[] {
    const t = (key: string) => this.translate.instant(key);
    return [
      {
        headerName: t('common.period'),
        valueGetter: (p) => `${p.data!.periodYear}-${String(p.data!.periodMonth).padStart(2, '0')}`
      },
      {
        field: 'status',
        headerName: t('common.status'),
        cellRenderer: (p: { value: PayrollRunStatus }) =>
          p.value === PayrollRunStatus.Approved
            ? badgeHtml(t('common.approved'), 'badge-approved')
            : badgeHtml(t('common.draft'), 'badge-draft')
      },
      { field: 'employeeCount', headerName: t('common.employees') },
      {
        field: 'totalNetSalary',
        headerName: t('payroll.totalNetSalary'),
        valueFormatter: (p) => formatNumber(p.value ?? 0, this.locale, '1.2-2')
      },
      {
        headerName: '',
        flex: 0,
        width: 130,
        sortable: false,
        resizable: false,
        cellRenderer: RowActionsCellRendererComponent,
        cellRendererParams: {
          actions: [{ label: t('common.view'), onClick: (row: PayrollRunListItem) => this.router.navigate(['/payroll', row.id]) }]
        }
      }
    ];
  }
}
