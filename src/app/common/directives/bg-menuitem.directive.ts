import { Directive, ElementRef, OnDestroy } from '@angular/core';
import { EventsService } from '../services/events.service';
import { Subscription } from 'rxjs';

/**
 * RouterLink which exports itself. Shouldn't be necessary to create this, but the built-in RouterLink does not have
 * exportAs, and there is no way to reference an arbitrary directive (see https://github.com/angular/angular/issues/8561)
 */

@Directive({
    selector: '.menuItem',
    exportAs: 'menuitem',
    host: {
        '[class.menuitem]': 'true',
    },
})
export class MenuItemDirective implements OnDestroy {
	menuItem: boolean;

	isOpen = false;
	private clickSubscription: Subscription;

	constructor(
		protected elemRef: ElementRef,
		protected eventService: EventsService,
	) {
		this.clickSubscription = eventService.documentClicked.subscribe((e) => this.onDocumentClick(e));
	}
	ngOnDestroy(): void {
		this.clickSubscription.unsubscribe();
	}

	protected get elem(): Element {
		return this.elemRef.nativeElement;
	}

	onDocumentClick(event: Event) {
		const buttonElem: Element = this.elem.querySelector(':scope > button');

		if (buttonElem && buttonElem.contains(event.target as Node)) {
			this.elem.classList.toggle('menuitem-is-open');
		} else {
			this.elem.classList.remove('menuitem-is-open');
		}
	}
}
