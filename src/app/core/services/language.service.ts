import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, tap } from 'rxjs';

export type AppLanguage = 'ar' | 'en';

const STORAGE_KEY = 'payroll.lang';

// Arabic/RTL is the default; toggling flips <html dir>/lang, swaps ngx-translate's
// active language, and mirrors the layout via CSS.
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  readonly language = signal<AppLanguage>(this.readInitialLanguage());
  readonly direction = signal<'rtl' | 'ltr'>(this.language() === 'ar' ? 'rtl' : 'ltr');

  constructor() {
    this.applyToDocument(this.language());
  }

  /** Loads the initial language's translations. Call once, from an app initializer. */
  init(): Observable<unknown> {
    return this.translate.use(this.language());
  }

  toggle(): void {
    this.set(this.language() === 'ar' ? 'en' : 'ar').subscribe();
  }

  set(language: AppLanguage): Observable<unknown> {
    return this.translate.use(language).pipe(
      tap(() => {
        this.language.set(language);
        this.direction.set(language === 'ar' ? 'rtl' : 'ltr');
        this.applyToDocument(language);

        try {
          localStorage.setItem(STORAGE_KEY, language);
        } catch {
          // Private browsing / storage disabled — the preference just won't persist.
        }
      })
    );
  }

  private applyToDocument(language: AppLanguage): void {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }

  private readInitialLanguage(): AppLanguage {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'ar' || stored === 'en') {
        return stored;
      }
    } catch {
      // Ignore — fall through to the default.
    }
    return 'ar';
  }
}
