import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PayrollCalculationMode } from '../../core/models/payroll.models';
import { PayrollSettingsService } from '../../core/services/payroll-settings.service';
import { ToastService } from '../../core/services/toast.service';

interface CalcExample {
  dept: number;
  service: number;
  attendance: number;
  net: number;
}

@Component({
  selector: 'app-calculation',
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './calculation.component.html'
})
export class CalculationComponent implements OnInit {
  private readonly service = inject(PayrollSettingsService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly PayrollCalculationMode = PayrollCalculationMode;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly mode = signal<PayrollCalculationMode>(PayrollCalculationMode.Additive);

  // Illustrative preview only — the backend PayrollCalculator is authoritative.
  readonly exampleAdditive = computed<CalcExample>(() => this.calculateAdditive(10000, 10, 5, -5));
  readonly exampleCompound = computed<CalcExample>(() => this.calculateCompound(10000, 10, 5, -5));

  ngOnInit(): void {
    this.service.get().subscribe((res) => {
      this.loading.set(false);
      if (res.object) this.mode.set(res.object.calculationMode);
    });
  }

  select(mode: PayrollCalculationMode): void {
    this.mode.set(mode);
  }

  save(): void {
    this.saving.set(true);
    this.service.update({ calculationMode: this.mode() }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.object) this.toast.success(this.translate.instant('settings.calculation.updated'));
      },
      error: () => this.saving.set(false)
    });
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private calculateAdditive(base: number, deptPct: number, servicePct: number, attendancePct: number): CalcExample {
    const dept = this.round((base * deptPct) / 100);
    const service = this.round((base * servicePct) / 100);
    const attendance = this.round((base * attendancePct) / 100);
    return { dept, service, attendance, net: base + dept + service + attendance };
  }

  private calculateCompound(base: number, deptPct: number, servicePct: number, attendancePct: number): CalcExample {
    const r1 = base;
    const dept = this.round((r1 * deptPct) / 100);
    const r2 = r1 + dept;
    const service = this.round((r2 * servicePct) / 100);
    const r3 = r2 + service;
    const attendance = this.round((r3 * attendancePct) / 100);
    return { dept, service, attendance, net: r3 + attendance };
  }
}
