import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SvgIconComponent } from '../svg-icon.component';

@Component({
    selector: 'bg-breadcrumbs',
    templateUrl: './bg-breadcrumbs.component.html',
    imports: [
        NgFor,
        NgIf,
        RouterLink,
        SvgIconComponent,
    ],
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
