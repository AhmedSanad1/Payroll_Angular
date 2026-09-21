import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination',
  imports: [TranslatePipe],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  readonly pageNumber = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly hasPreviousPage = input.required<boolean>();
  readonly hasNextPage = input.required<boolean>();
  readonly pageChange = output<number>();

  previous(): void {
    if (this.hasPreviousPage()) this.pageChange.emit(this.pageNumber() - 1);
  }

  next(): void {
    if (this.hasNextPage()) this.pageChange.emit(this.pageNumber() + 1);
  }
}
