import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DepartmentLookup, JobGrade } from '../../../core/models/payroll.models';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { JobGradeService } from '../../../core/services/job-grade.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './employee-form.component.html'
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly jobGradeService = inject(JobGradeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly departments = signal<DepartmentLookup[]>([]);
  readonly jobGrades = signal<JobGrade[]>([]);
  readonly saving = signal(false);
  readonly employeeId = signal<number | null>(null);
  readonly fieldErrors = signal<Record<string, string[]>>({});

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    birthDate: ['', Validators.required],
    address: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    jobGradeId: [0, [Validators.required, Validators.min(1)]],
    departmentId: [0, [Validators.required, Validators.min(1)]],
    hireDate: ['', Validators.required]
  });

  get isEditMode(): boolean {
    return this.employeeId() !== null;
  }

  ngOnInit(): void {
    this.departmentService.getLookup().subscribe((res) => this.departments.set(res.object ?? []));
    this.jobGradeService.getAll().subscribe((res) => this.jobGrades.set(res.object ?? []));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.employeeId.set(id);
      this.employeeService.getById(id).subscribe((res) => {
        if (res.object) {
          this.form.patchValue({
            fullName: res.object.fullName,
            birthDate: res.object.birthDate,
            address: res.object.address,
            phone: res.object.phone,
            email: res.object.email,
            jobGradeId: res.object.jobGradeId,
            departmentId: res.object.departmentId,
            hireDate: res.object.hireDate
          });
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.fieldErrors.set({});
    const value = this.form.getRawValue();

    const request$ = this.isEditMode
      ? this.employeeService.update(this.employeeId()!, { id: this.employeeId()!, ...value })
      : this.employeeService.create(value);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.object) {
          this.toast.success(this.translate.instant(this.isEditMode ? 'employees.updated' : 'employees.created'));
          this.router.navigateByUrl('/employees');
        } else if (res.errors) {
          this.fieldErrors.set(res.errors);
        }
      },
      error: (err: { error?: { errors?: Record<string, string[]> } }) => {
        this.saving.set(false);
        if (err.error?.errors) {
          this.fieldErrors.set(err.error.errors);
        }
      }
    });
  }
}
