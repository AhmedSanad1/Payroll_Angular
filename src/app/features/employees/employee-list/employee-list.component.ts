import { formatDate } from '@angular/common';
import { Component, LOCALE_ID, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { DepartmentLookup, EmployeeListItem, JobGrade } from '../../../core/models/payroll.models';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { JobGradeService } from '../../../core/services/job-grade.service';
import { LanguageService } from '../../../core/services/language.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { payrollGridTheme } from '../../../shared/ag-grid/grid-theme';
import { RowActionsCellRendererComponent } from '../../../shared/ag-grid/row-actions-cell-renderer.component';

@Component({
  selector: 'app-employee-list',
  imports: [FormsModule, RouterLink, PaginationComponent, TranslatePipe, AgGridAngular],
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly jobGradeService = inject(JobGradeService);
  private readonly toast = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);
  readonly language = inject(LanguageService);

  readonly items = signal<EmployeeListItem[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly departmentId = signal<number | null>(null);
  readonly jobGradeId = signal<number | null>(null);

  readonly pageNumber = signal(1);
  readonly pageSize = 20;
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);
  readonly hasPreviousPage = signal(false);
  readonly hasNextPage = signal(false);

  readonly departments = signal<DepartmentLookup[]>([]);
  readonly jobGrades = signal<JobGrade[]>([]);

  readonly theme = payrollGridTheme;
  readonly defaultColDef: ColDef = { sortable: true, resizable: true, flex: 1, minWidth: 120 };
  readonly colDefs = signal<ColDef<EmployeeListItem>[]>([]);

  private gridApi?: GridApi<EmployeeListItem>;
  private readonly langChangeSub = this.translate.onLangChange.subscribe(() => this.colDefs.set(this.buildColDefs()));

  ngOnInit(): void {
    this.colDefs.set(this.buildColDefs());
    this.departmentService.getLookup().subscribe((res) => this.departments.set(res.object ?? []));
    this.jobGradeService.getAll().subscribe((res) => this.jobGrades.set(res.object ?? []));
    this.load();
  }

  ngOnDestroy(): void {
    this.langChangeSub.unsubscribe();
  }

  onGridReady(event: GridReadyEvent<EmployeeListItem>): void {
    this.gridApi = event.api;
  }

  load(): void {
    this.loading.set(true);
    this.employeeService
      .getPaged({
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize,
        search: this.search() || undefined,
        departmentId: this.departmentId(),
        jobGradeId: this.jobGradeId()
      })
      .subscribe((res) => {
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

  applyFilters(): void {
    this.pageNumber.set(1);
    this.load();
  }

  goToPage(page: number): void {
    this.pageNumber.set(page);
    this.load();
  }

  async remove(employee: EmployeeListItem): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: this.translate.instant('employees.deleteTitle'),
      message: this.translate.instant('employees.deleteMessage', { name: employee.fullName }),
      confirmText: this.translate.instant('common.delete'),
      danger: true
    });
    if (!confirmed) return;

    this.employeeService.delete(employee.id).subscribe((res) => {
      if (res.object) {
        this.toast.success(this.translate.instant('employees.deleted'));
        this.load();
      }
    });
  }

  private buildColDefs(): ColDef<EmployeeListItem>[] {
    const t = (key: string) => this.translate.instant(key);
    return [
      { field: 'fullName', headerName: t('common.name') },
      { field: 'email', headerName: t('common.email') },
      { field: 'phone', headerName: t('common.phone') },
      { field: 'departmentName', headerName: t('common.department') },
      { field: 'gradeName', headerName: t('common.grade') },
      {
        field: 'hireDate',
        headerName: t('common.hireDate'),
        valueFormatter: (p) => (p.value ? formatDate(p.value, 'yyyy-MM-dd', this.locale) : '')
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
            { label: t('common.edit'), onClick: (row: EmployeeListItem) => this.router.navigate(['/employees', row.id]) },
            { label: t('common.delete'), variant: 'danger', onClick: (row: EmployeeListItem) => this.remove(row) }
          ]
        }
      }
    ];
  }
}
