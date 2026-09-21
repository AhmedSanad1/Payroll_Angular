import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [TranslatePipe],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  private readonly service = inject(ConfirmDialogService);
  readonly options = this.service.options;

  confirm(): void {
    this.service.resolve(true);
  }

  cancel(): void {
    this.service.resolve(false);
  }
}
