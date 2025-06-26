import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
	constructor(private breakpointObserver: BreakpointObserver) {}

	isMobile$: Observable<boolean> = this.breakpointObserver
		.observe([Breakpoints.XSmall, Breakpoints.Small])
		.pipe(map((result) => result.matches));

	// TODO: check if we can delete this and use the predefined breakpoints listed
	// here: https://material.angular.dev/cdk/layout/overview#predefined-breakpoints
	isCustomMobile$: Observable<boolean> = this.breakpointObserver
		.observe('(max-width: 767px)')
		.pipe(map((result) => result.matches));
}
