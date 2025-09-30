import { Component, Input } from '@angular/core';

import { RouterLink } from '@angular/router';
import { SvgIconComponent } from '../svg-icon.component';

@Component({
	selector: 'bg-breadcrumbs',
	templateUrl: './bg-breadcrumbs.component.html',
	imports: [RouterLink, SvgIconComponent],
})
export class BgBreadcrumbsComponent {
	@Input() linkentries: LinkEntry[];
}

export interface LinkEntry {
	routerLink?: string[];
	title: string;
	queryParams?: { [key: string]: any };
}
