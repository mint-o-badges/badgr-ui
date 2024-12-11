import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseRoutableComponent } from '../../../common/pages/base-routable.component';


@Component({
	selector: 'app-terms',
	templateUrl: './terms-of-service.component.html',
	styleUrls: ['./terms-of-service.component.css'],
})
export class TermsComponent extends BaseRoutableComponent implements OnInit {
	constructor(
		router: Router,
		route: ActivatedRoute,
	) {
		super(router, route);
	}

	ngOnInit() {
		console.log(this.router.isActive)
	}
}
