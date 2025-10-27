import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
	private breakpointObserver = inject(BreakpointObserver);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}

	isMobile$: Observable<boolean> = this.breakpointObserver
		.observe([Breakpoints.XSmall, Breakpoints.Small])
		.pipe(map((result) => result.matches));

	observeCustomBreakpoint = (maxWidth: number): Observable<boolean> =>
		this.breakpointObserver.observe(`(max-width: ${maxWidth}px)`).pipe(map((result) => result.matches));
}
