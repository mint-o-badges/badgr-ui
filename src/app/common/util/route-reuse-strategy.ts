// This impl. bases upon one that can be found in the router's test cases.
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { Injectable } from '@angular/core';

/**
 * Route Reuse Strategy for Badgr. Our routable components were designed before route reuse was the default and as such
 * are not built to handle it correctly. This implementation simply rejects all requests to reuse routes.
 */
@Injectable()
export class BadgrRouteReuseStrategy implements RouteReuseStrategy {
	/**
	 * Determines if this route (and its subtree) should be detached to be reused later.
	 */
	shouldDetach(route: ActivatedRouteSnapshot): boolean {
		return false;
	}

	/**
	 * Stores the detached route.
	 */
	store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {}

	/**
	 * Determines if this route (and its subtree) should be reattached.
	 */
	shouldAttach(route: ActivatedRouteSnapshot): boolean {
		return false;
	}

	/**
	 * Retrieves the previously stored route.
	 */
	retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
		return null;
	}

	/**
	 * Determines if a route should be reused.
	 */
	shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
		return false;
	}
}
