import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html'
})
export class ToastContainerComponent {
  private readonly service = inject(ToastService);
  readonly messages = this.service.messages;

  dismiss(id: number): void {
    this.service.dismiss(id);
  }
}
