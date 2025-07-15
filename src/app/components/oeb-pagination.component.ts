import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
	HlmPaginationContentDirective,
	HlmPaginationDirective,
	HlmPaginationEllipsisComponent,
	HlmPaginationItemDirective,
	HlmPaginationLinkDirective,
	HlmPaginationNextComponent,
	HlmPaginationPreviousComponent,
} from './spartan/ui-pagination-helm/src';

@Component({
	selector: 'oeb-pagination',
	imports: [
		HlmPaginationDirective,
		HlmPaginationContentDirective,
		HlmPaginationItemDirective,
		HlmPaginationPreviousComponent,
		HlmPaginationNextComponent,
		HlmPaginationLinkDirective,
		HlmPaginationEllipsisComponent,
	],
	template: `
		<nav hlmPagination class="tw-mt-4">
			<ul hlmPaginationContent>
				<li hlmPaginationItem>
					@if (currentPage > 1) {
						<hlm-pagination-previous (click)="changePage(currentPage - 1)" />
					}
				</li>

				@for (page of getPageNumbers(); track page) {
					<li hlmPaginationItem (click)="changePage(page)">
						@if (page.toString() === '...') {
							<hlm-pagination-ellipsis />
						}
						<a hlmPaginationLink [isActive]="page === currentPage">{{ page }}</a>
					</li>
				}

				<li hlmPaginationItem>
					<hlm-pagination-ellipsis />
				</li>
				@if (currentPage < totalPages) {
					<li hlmPaginationItem (click)="changePage(currentPage + 1)">
						<hlm-pagination-next />
					</li>
				}
			</ul>
		</nav>
	`,
})
export class OebPaginationComponent {
	@Input() currentPage = 1;
	@Input() totalPages = 1;
	@Input() nextLink: string | null = null;
	@Input() previousLink: string | null = null;
	@Output() pageChange = new EventEmitter<number>();

	changePage(page: number) {
		this.pageChange.emit(page);
	}

	getPageNumbers(): number[] {
		const pages: number[] = [];
		for (let i = 1; i <= this.totalPages; i++) {
			pages.push(i);
		}
		return pages;
	}

	get hasEllipsis(): boolean {
		return this.totalPages > 5;
	}
}
