import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideTranslateService } from '@ngx-translate/core';
import { ngxSpinnerInterceptor, provideNgxSpinnerHttpConfig } from 'ngx-spinner';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/services/auth.service';
import { LanguageService } from './core/services/language.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Spinner interceptor goes first so it wraps the auth-refresh retry and error handling too,
    // staying visible for the whole round trip rather than just the first attempt.
    provideHttpClient(withInterceptors([ngxSpinnerInterceptor, authInterceptor, errorInterceptor])),
    provideNgxSpinnerHttpConfig({ excludedUrls: ['/i18n/'] }),
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' })
    }),
    // Loads the initial language's strings and tries a silent refresh (access tokens
    // don't survive a reload) before the app renders, so there's no untranslated flash.
    provideAppInitializer(() => {
      const language = inject(LanguageService);
      const auth = inject(AuthService);
      return firstValueFrom(language.init()).then(() => firstValueFrom(auth.refresh()));
    })
  ]
};
