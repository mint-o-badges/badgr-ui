import { ComponentFactoryResolver, Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { LoadingDotsComponent } from '../components/loading-dots.component';
import { LoadingErrorComponent } from '../components/loading-error.component';

/**
 *
 *
 * ### Example
 *
 * ```
 * <div *bgAwaitPromises="[promise1, promise2]">
 *     <!-- content to be displayed when promise1 and promise2 are complete -->
 *     <!-- otherwise LoadingDotComponent appears -->
 * </div>
 *
 * - or -
 *
 * <ng-template [showLoader]="false" [bgAwaitPromises]="[promise1, promise2]">
 *
 * Make sure to use the `[showLoader]` tag *before* the `[bgAwaitPromises]` tag -
 * the order matters!
 */

@Directive({
	selector: '[bgAwaitPromises]',
	standalone: false,
})
export class BgAwaitPromises {
	currentPromise: Promise<unknown>;
	indicatorClassName: string;

	constructor(
		private viewContainer: ViewContainerRef,
		private template: TemplateRef<unknown>,
		private componentResolver: ComponentFactoryResolver,
	) {}

	@Input() showLoader = true;

	@Input() set bgAwaitPromises(
		newValue:
			| Array<Promise<unknown> | Array<{ loadedPromise: Promise<unknown> }> | { loadedPromise: Promise<unknown> }>
			| Promise<unknown>
			| { loadedPromise: Promise<unknown> },
	) {
		let newPromises: Array<Promise<unknown>> = [];

		if (Array.isArray(newValue)) {
			newPromises = newValue
				.filter((p) => !!p)
				.map((value: object) =>
					'loadedPromise' in value
						? (value['loadedPromise'] as Promise<unknown>)
						: (value as Promise<unknown>),
				);
		} else if (newValue && 'loadedPromise' in newValue) {
			newPromises = [(newValue as object)['loadedPromise']];
		} else if (newValue) {
			newPromises = [newValue as Promise<unknown>];
		}

		if (newPromises.length > 0) {
			// promises to wait for, display loading dots
			if (this.showLoader) this.showLoadingAnimation();
			this.currentPromise = Promise.all(newPromises).then(
				() => this.showTemplate(),
				(error) => this.showError(error),
			);
		} else {
			// no promises given, display template
			this.showTemplate();
		}
	}

	/*@Input() set bgAwaitClass(newClassName: string) {
		this.indicatorClassName = newClassName;
	}*/

	private showTemplate(): void {
		this.viewContainer.clear();
		this.viewContainer.createEmbeddedView(this.template);
	}

	private showError(error: unknown) {
		console.error(error);
		const factory = this.componentResolver.resolveComponentFactory(LoadingErrorComponent);

		this.viewContainer.clear();

		const componentRef = this.viewContainer.createComponent(factory);
		componentRef.instance.className = this.indicatorClassName;
		componentRef.instance.errorMessage = (typeof error === 'object' && error['message']) || error;
	}

	private showLoadingAnimation(): void {
		const factory = this.componentResolver.resolveComponentFactory(LoadingDotsComponent);

		this.viewContainer.clear();
		const componentRef = this.viewContainer.createComponent(factory);
		componentRef.instance.className = this.indicatorClassName;
	}
}
