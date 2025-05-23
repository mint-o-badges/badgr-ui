import { Component, input, model } from '@angular/core';
import { HlmNumberedPaginationComponent } from './spartan/ui-pagination-helm/src/lib/hlm-numbered-pagination.component';

@Component({
	selector: 'oeb-numbered-pagination',
	standalone: true,
	imports: [HlmNumberedPaginationComponent],
	template: `
		<hlm-numbered-pagination [(currentPage)]="page" [(itemsPerPage)]="pageSize" [totalItems]="totalProducts()" />
	`,
})
export class PaginationAdvancedComponent {
	page = model(1);
	pageSize = model(30);
	totalProducts = input(0);
}
