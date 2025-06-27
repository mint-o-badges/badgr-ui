import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
	constructor(private breakpointObserver: BreakpointObserver) {}

	isMobile$: Observable<boolean> = this.breakpointObserver
		.observe([Breakpoints.XSmall, Breakpoints.Small])
		.pipe(map((result) => result.matches));

	observeCustomBreakpoint = (maxWidth: number): Observable<boolean> =>
		this.breakpointObserver.observe(`(max-width: ${maxWidth}px)`).pipe(map((result) => result.matches));
}
