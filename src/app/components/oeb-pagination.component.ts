
import { Component } from '@angular/core';
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
		<nav hlmPagination>
			<ul hlmPaginationContent>
				<li hlmPaginationItem>
					<hlm-pagination-previous link="/components/menubar" />
				</li>
				<li hlmPaginationItem>
					<a hlmPaginationLink link="#">1</a>
				</li>
				<li hlmPaginationItem>
					<a hlmPaginationLink link="#" isActive>2</a>
				</li>
				<li hlmPaginationItem>
					<a hlmPaginationLink link="#">3</a>
				</li>
				<li hlmPaginationItem>
					<hlm-pagination-ellipsis />
				</li>
				<li hlmPaginationItem>
					<hlm-pagination-next link="/components/popover" />
				</li>
			</ul>
		</nav>
	`
})
export class OebPaginationComponent {}
