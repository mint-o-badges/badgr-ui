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
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

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
		CommonModule,
		NgIcon
	],
	template: `
		<nav hlmPagination class='tw-mt-4'>
			<ul hlmPaginationContent>
				<li hlmPaginationItem>
					<hlm-pagination-previous iconOnly="true" (click)="changePage(currentPage - 1)" *ngIf="currentPage > 1" />
				</li>
				<li hlmPaginationItem *ngFor="let page of getPageNumbers()" (click)="changePage(page)">
					<a hlmPaginationLink [isActive]="page === currentPage">{{ page }}</a>
				</li>

				<li hlmPaginationItem>
					<hlm-pagination-ellipsis />
				</li>
				<li hlmPaginationItem (click)="changePage(currentPage + 1)" *ngIf="currentPage < totalPages">
					<hlm-pagination-next iconOnly="true" />
				</li>
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
