import { AfterViewInit, Component, Directive, ElementRef, Input, NgZone, Renderer2 } from '@angular/core';
import { OnDestroy } from '@angular/core';
import Popper, { Placement } from 'popper.js';

/**
 * Directive that implements popper.js-based popup menus
 */
@Component({
	selector: 'bg-popup-menu',
	template: '<ng-content></ng-content>',
	host: {
		class: 'menu',
		'[attr.inert]': '(! isOpen) || undefined',
	},
})
export class BgPopupMenu implements OnDestroy, AfterViewInit, OnDestroy {
	get componentElem(): HTMLElement {
		return this.componentElemRef.nativeElement! as HTMLElement;
	}

	get isOpen() {
		return this.componentElem && this.componentElem.classList.contains('menu-is-open');
	}
	triggerData: unknown = null;

	@Input()
	closeOnOutsideClick = true;

	@Input()
	closeOnInsideClick = true;

	@Input()
	menuPlacement: Placement = 'bottom-end';
	private popper: Popper | null = null;
	private lastTriggerElem: HTMLElement | null = null;

	private removeWindowClickListener?: (() => void) | null = null;

	constructor(
		private componentElemRef: ElementRef,
		private renderer: Renderer2,
		private ngZone: NgZone,
	) {}

	open(triggerElem: HTMLElement) {
		this.lastTriggerElem = triggerElem;

		if (!this.popper) {
			// Create the popper outside of Angular so that the popper event handlers don't trigger angular updates
			this.ngZone.runOutsideAngular(() => {
				this.popper = new Popper(triggerElem || document.body, this.componentElem!, {
					placement: this.menuPlacement,
					onCreate: () => {
						const firstTabbable = this.componentElem.querySelector<HTMLElement>(
							'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]',
						);
						if (firstTabbable) firstTabbable.focus();
					},
				});
			});

			// Bind the window click handler only on open because there is a performance overhead for each window-level event handler created.
			// This handler should be removed when the popup menu is closed.
			this.removeWindowClickListener = this.renderer.listen('window', 'click', (event) =>
				this.handleClick(event),
			);
		}

		this.componentElem.style.display = '';
		this.componentElem.classList.toggle('menu-is-open', true);
	}

	close() {
		this.componentElem.classList.toggle('menu-is-open', false);

		if (this.popper) {
			this.cleanUp();
			this.popper = null;
			this.hideElem();
		}
	}

	toggle(triggerElem: HTMLElement) {
		if (!this.isOpen || this.lastTriggerElem !== triggerElem) {
			if (this.isOpen) this.close();

			this.open(triggerElem);
		} else if (this.isOpen) {
			this.close();
		}
	}

	ngAfterViewInit(): void {
		// Move the dropdown element to the body so it can be positioned properly
		document.body.appendChild(this.componentElem!);
		this.hideElem();
	}

	ngOnDestroy(): void {
		if (this.componentElem) {
			this.componentElem.remove();
		}

		if (this.popper) this.cleanUp();
	}

	cleanUp = () => {
		this.popper.destroy();
		if (this.removeWindowClickListener) {
			this.removeWindowClickListener();
			this.removeWindowClickListener = null;
		}
	};

	handleClick(event: Event) {
		if (this.componentElem) {
			if (this.lastTriggerElem && this.lastTriggerElem.contains(event.target as Node)) {
				return;
			}

			if (this.componentElem.contains(event.target as Node)) {
				if (this.closeOnInsideClick) {
					this.close();
				}
			} else if (this.closeOnOutsideClick) {
				this.close();
			}
		}
	}

	private hideElem() {
		this.componentElem.style.position = 'absolute';
		this.componentElem.style.top = '-1000px';
		this.componentElem.style.left = '-1000px';
	}
}

@Directive({
	selector: '[bgPopupMenuTrigger]',
	host: {
		'(click)': 'handleClick()',
	},
})
export class BgPopupMenuTriggerDirective {
	@Input('bgPopupMenuTrigger')
	private menu: BgPopupMenu | null = null;

	@Input('bgPopupMenuData')
	private triggerData: unknown = null;

	constructor(private componentElemRef: ElementRef) {}

	handleClick() {
		if (this.menu) {
			this.menu.triggerData = this.triggerData;
			this.menu.toggle(this.componentElemRef.nativeElement as HTMLElement);
		}
	}
}
