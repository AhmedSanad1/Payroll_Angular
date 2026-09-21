import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  kind: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly messages = signal<ToastMessage[]>([]);

  show(text: string, kind: ToastMessage['kind'] = 'info', durationMs = 4500): void {
    const id = this.nextId++;
    this.messages.update((list) => [...list, { id, text, kind }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  success(text: string): void {
    this.show(text, 'success');
  }

  error(text: string): void {
    this.show(text, 'error');
  }

  dismiss(id: number): void {
    this.messages.update((list) => list.filter((m) => m.id !== id));
  }
}
