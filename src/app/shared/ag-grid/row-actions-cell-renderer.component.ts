import { Component } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

export interface RowAction<T> {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: (data: T) => void;
  hidden?: (data: T) => boolean;
  disabled?: (data: T) => boolean;
}

export interface RowActionsParams<T> extends ICellRendererParams<T> {
  actions: RowAction<T>[];
}

// Generic row-actions column for ag-grid tables: renders the same edit/delete/view
// button set every list screen in this app already used in plain <table> markup.
@Component({
  selector: 'app-row-actions-cell-renderer',
  template: `
    <div class="text-end" style="display: flex; gap: 0.4rem; justify-content: flex-end;">
      @for (action of visibleActions; track action.label) {
        <button
          type="button"
          class="btn btn-sm"
          [class.btn-primary]="action.variant === 'primary'"
          [class.btn-secondary]="!action.variant || action.variant === 'secondary'"
          [class.btn-danger]="action.variant === 'danger'"
          [disabled]="!!action.disabled?.(data)"
          (click)="action.onClick(data)"
        >
          {{ action.label }}
        </button>
      }
    </div>
  `
})
export class RowActionsCellRendererComponent<T = unknown> implements ICellRendererAngularComp {
  actions: RowAction<T>[] = [];
  data!: T;

  get visibleActions(): RowAction<T>[] {
    return this.actions.filter((a) => !a.hidden?.(this.data));
  }

  agInit(params: RowActionsParams<T>): void {
    this.actions = params.actions;
    this.data = params.data as T;
  }

  refresh(params: RowActionsParams<T>): boolean {
    this.actions = params.actions;
    this.data = params.data as T;
    return true;
  }
}
