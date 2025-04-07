import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

/**
 * Component that redirects the user to a different view. Used for working around https://github.com/angular/angular/issues/9811#issuecomment-248043993
 */
@Component({
	template: '',
	standalone: false,
})
export class ForwardRouteComponent implements OnInit {
	constructor(
		private router: Router,
		private route: ActivatedRoute,
	) {}

	ngOnInit(): void {
		this.router.navigate(JSON.parse(decodeURIComponent(this.route.snapshot.params['data'])), {
			skipLocationChange: true,
		});
	}
}
