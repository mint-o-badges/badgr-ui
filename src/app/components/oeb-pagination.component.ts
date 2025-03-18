
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

@Component({
	selector: 'oeb-pagination',
	standalone: true,
	imports: [
		HlmPaginationDirective,
		HlmPaginationContentDirective,
		HlmPaginationItemDirective,
		HlmPaginationPreviousComponent,
		HlmPaginationNextComponent,
		HlmPaginationLinkDirective,
		HlmPaginationEllipsisComponent,
		CommonModule
	],
	template: `
		<nav hlmPagination>
      <ul hlmPaginationContent>
        <!-- Previous Button -->
        <li hlmPaginationItem *ngIf="previousLink">
          <hlm-pagination-previous (click)="changePage(previousLink)" />
        </li>

        <!-- Page Numbers -->
        <li hlmPaginationItem *ngFor="let page of getPageNumbers()" [class.active]="page === currentPage">
          <a hlmPaginationLink href="#" (click)="changePage(getPageUrl(page))">{{ page }}</a>
        </li>

        <!-- Ellipsis -->
        <li hlmPaginationItem *ngIf="hasEllipsis">
          <hlm-pagination-ellipsis />
        </li>

        <!-- Next Button -->
        <li hlmPaginationItem *ngIf="nextLink">
          <hlm-pagination-next (click)="changePage(nextLink)" />
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
  @Output() pageChange = new EventEmitter<string>(); 

  changePage(url: string) {
    this.pageChange.emit(url);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getPageUrl(page: number): string {
    return `?limit=20&offset=${(page - 1) * 20}`;
  }

  get hasEllipsis(): boolean {
    return this.totalPages > 5;
  }
}
