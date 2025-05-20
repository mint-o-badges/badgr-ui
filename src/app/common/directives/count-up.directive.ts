import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { BehaviorSubject, animationFrameScheduler, interval, combineLatest, pipe } from 'rxjs';
import { distinctUntilChanged, endWith, map, switchMap, takeUntil, takeWhile } from 'rxjs/operators';
import { Destroy } from './destroy';

@Directive({
    selector: '[countUp]',
    providers: [Destroy],
})
export class CountUpDirective {
	@Input('countUp')
	set count(count: number) {
		this.count$.next(count);
	}

	@Input()
	set duration(duration: number) {
		this.duration$.next(duration);
	}

	constructor(
		private readonly elementRef: ElementRef,
		private readonly renderer: Renderer2,
		private readonly destroy$: Destroy,
	) {}
	private readonly count$ = new BehaviorSubject(0);
	private readonly duration$ = new BehaviorSubject(2000);

	private readonly currentCount$ = combineLatest([this.count$, this.duration$]).pipe(
		switchMap(([count, animationDuration]) => {
			const frameDuration = 1000 / 60; // 60 frames per second
			const totalFrames = Math.round(animationDuration / frameDuration);

			// interval falls back to `asyncScheduler`
			// because the `frameDuration` is different from 0
			return interval(frameDuration, animationFrameScheduler).pipe(
				// calculate progress
				map((currentFrame) => currentFrame / totalFrames),
				// complete when progress is greater than 1
				takeWhile((progress) => progress <= 1),
				// apply quadratic ease-out function
				map((progress) => progress * (2 - progress)),
				// calculate current count
				map((progress) => Math.round(progress * count)),
				// make sure that last emitted value is count
				endWith(count),
				distinctUntilChanged(),
			);
		}),
	);

	private displayCurrentCount(): void {
		this.currentCount$.pipe(takeUntil(this.destroy$)).subscribe((currentCount) => {
			this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', currentCount);
		});
	}
}
