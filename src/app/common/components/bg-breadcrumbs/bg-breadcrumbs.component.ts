import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'bg-breadcrumbs',
	templateUrl: './bg-breadcrumbs.component.html',
	standalone: false,
})
export class BgBreadcrumbsComponent implements OnInit {
	@Input() linkentries: LinkEntry[];

	constructor() {}

	ngOnInit() {}
}

export interface LinkEntry {
	routerLink?: string[];
	title: string;
}
