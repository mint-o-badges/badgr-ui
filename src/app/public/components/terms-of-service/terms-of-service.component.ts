import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';

@Component({
	selector: 'app-terms',
	templateUrl: './terms-of-service.component.html',
	styleUrls: ['./terms-of-service.component.css'],
})
export class TermsComponent extends BaseRoutableComponent implements OnInit {
	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const router = inject(Router);
		const route = inject(ActivatedRoute);

		super(router, route);
	}

	ngOnInit() {
		console.log(this.router.isActive);
	}
}
