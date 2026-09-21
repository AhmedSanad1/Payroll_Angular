import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from './shared/toast/toast-container.component';

@Component({
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent, NgxSpinnerComponent],
  selector: 'app-root',
  templateUrl: './app.html'
})
export class App {}
