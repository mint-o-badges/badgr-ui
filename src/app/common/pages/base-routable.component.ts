import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Base class for all routable components (pages).
 *
 * This class used to work around the fact that routes are reused in the Angular2 v3 router. We now handle this using
 * `BadgrRouteReuseStrategy`, but this class is kept to denote routable components and for future use.
 */
@Injectable()
export class BaseRoutableComponent {
	protected router = inject(Router);
	protected route = inject(ActivatedRoute);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}
}
