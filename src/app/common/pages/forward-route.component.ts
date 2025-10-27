import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';

/**
 * Component that redirects the user to a different view. Used for working around https://github.com/angular/angular/issues/9811#issuecomment-248043993
 */
@Component({ template: '' })
export class ForwardRouteComponent implements OnInit {
	private router = inject(Router);
	private route = inject(ActivatedRoute);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}

	ngOnInit(): void {
		this.router.navigate(JSON.parse(decodeURIComponent(this.route.snapshot.params['data'])), {
			skipLocationChange: true,
		});
	}
}
