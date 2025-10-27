import { Injectable, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {
	router = inject(Router);

	currentRouteData: BadgrRouteData = {};
	browserRefresh = false;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const router = this.router;

		router.events.subscribe(async (e) => {
			if (e instanceof NavigationEnd) {
				// Clear the navigation items when finished routing
				this.currentRouteData = {};
				this.findAndApplyRouteNavConfig(router.routerState.snapshot.root);
			}

			// Detect browser refresh
			if (e instanceof NavigationStart) {
				this.browserRefresh = !router.navigated;
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
