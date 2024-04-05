import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable()
export class NavigationService {
	currentRouteData: BadgrRouteData = {};

	constructor(public router: Router) {
		router.events.subscribe(async (e) => {
			if (e instanceof NavigationEnd) {
				// Clear the navigation items when finished routing
				this.currentRouteData = {};
				this.findAndApplyRouteNavConfig(router.routerState.snapshot.root);
			}
		});
	}

	private findAndApplyRouteNavConfig(route: ActivatedRouteSnapshot) {
		this.currentRouteData = { ...this.currentRouteData, ...route.data };
		route.children.forEach((child) => this.findAndApplyRouteNavConfig(child));
	}
}

export interface BadgrRouteData {
	publiclyAccessible?: boolean;
}
