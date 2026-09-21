import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly options = signal<ConfirmOptions | null>(null);
  private resolver: ((result: boolean) => void) | null = null;

  confirm(options: ConfirmOptions): Promise<boolean> {
    this.options.set(options);
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  resolve(result: boolean): void {
    this.resolver?.(result);
    this.resolver = null;
    this.options.set(null);
  }
}
