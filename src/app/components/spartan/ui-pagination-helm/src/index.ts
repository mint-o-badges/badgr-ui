import { NgModule } from '@angular/core';

import { HlmNumberedPagination } from './lib/hlm-numbered-pagination.component';
import { HlmPaginationContent } from './lib/hlm-pagination-content.directive';
import { HlmPaginationEllipsis } from './lib/hlm-pagination-ellipsis.component';
import { HlmPaginationItem } from './lib/hlm-pagination-item.directive';
import { HlmPaginationLink } from './lib/hlm-pagination-link.directive';
import { HlmPaginationNext } from './lib/hlm-pagination-next.component';
import { HlmPaginationPrevious } from './lib/hlm-pagination-previous.component';
import { HlmPagination } from './lib/hlm-pagination.directive';

export * from './lib/hlm-numbered-pagination.component';
export * from './lib/hlm-pagination-content.directive';
export * from './lib/hlm-pagination-ellipsis.component';
export * from './lib/hlm-pagination-item.directive';
export * from './lib/hlm-pagination-link.directive';
export * from './lib/hlm-pagination-next.component';
export * from './lib/hlm-pagination-previous.component';
export * from './lib/hlm-pagination.directive';

export const HlmPaginationImports = [
	HlmPagination,
	HlmPaginationContent,
	HlmPaginationItem,
	HlmPaginationLink,
	HlmPaginationPrevious,
	HlmPaginationNext,
	HlmPaginationEllipsis,
	HlmNumberedPagination,
] as const;

@NgModule({
	imports: [...HlmPaginationImports],
	exports: [...HlmPaginationImports],
})
export class HlmPaginationModule {}
