import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { NgIcon } from '@ng-icons/core';

@Component({
	selector: 'bg-breadcrumbs',
	templateUrl: './bg-breadcrumbs.component.html',
	imports: [RouterLink, NgIcon, HlmIcon],
})
export class BgBreadcrumbsComponent {
	@Input() linkentries: LinkEntry[];
}

export interface LinkEntry {
	routerLink?: string[];
	title: string;
	queryParams?: { [key: string]: any };
}
