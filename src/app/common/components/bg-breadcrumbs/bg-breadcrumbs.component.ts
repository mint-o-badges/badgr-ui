import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'bg-breadcrumbs',
	templateUrl: './bg-breadcrumbs.component.html',
})
export class BgBreadcrumbsComponent implements OnInit {
	@Input() linkentries: LinkEntry[];
	@Input() divider: Boolean = true;

	constructor() {}

	ngOnInit() {}
}

export interface LinkEntry {
	routerLink?: string[];
	title: string;
}
