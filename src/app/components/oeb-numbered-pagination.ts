
import { Component, signal, input, EventEmitter, Output, model } from '@angular/core';
import { HlmNumberedPaginationComponent } from '../components/spartan/ui-pagination-helm/src';

@Component({
	selector: 'spartan-pagination-advanced',
	standalone: true,
	imports: [HlmNumberedPaginationComponent],
	template: `
    <hlm-numbered-pagination
      [(currentPage)]="page"
      [(itemsPerPage)]="pageSize"
      [totalItems]="totalProducts()"
    />
	`,
})
export class PaginationAdvancedComponent {
  page = model(1);
  pageSize = signal(30);
  totalProducts = input(0);
}
