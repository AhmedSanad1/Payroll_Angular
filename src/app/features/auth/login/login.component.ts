import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly currentYear = new Date().getFullYear();

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  get username() {
    return this.form.controls.username;
  }

  get password() {
    return this.form.controls.password;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.object) {
          this.router.navigateByUrl('/dashboard');
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? this.translate.instant('auth.loginFailed'));
      }
    });
  }
}
