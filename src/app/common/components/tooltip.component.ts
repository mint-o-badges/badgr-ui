import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild} from '@angular/core';

import * as Tether from 'tether';

@Component({
	selector: 'tooltip',
	template: `
		<span #anchor
		      (click)="toggleTip()"
		><ng-content select=".trigger"></ng-content></span>
		<div #tooltip
		     class="tooltip"
		     [ngClass]="{'tooltip-is-active':active}"
		>
			<span class="tooltip-x-arrow"></span>
			<div class="tooltip-x-content">
				<button type="button"
				        (click)="updateTip(false)"
				>Close
				</button>
				<ng-content select="header"></ng-content>
				<ng-content select="content"></ng-content>
				<ng-content select="footer"></ng-content>
			</div>
		</div>
	`,
})

export class TooltipComponent implements AfterViewInit, OnDestroy {
	@Input() position = {
		attachment: 'bottom left',
		targetAttachment: 'middle right'
	};
	@Input() offset = '-30px -15px';
	@Input() trigger;
	@ViewChild('anchor') anchor: ElementRef;
	@ViewChild('tooltip') tooltip: ElementRef;

	active = false;
	tether: Tether | null = null;

	toggleTip() {
		this.updateTip(!this.active);
		return false;
	}

	@HostListener('document:click', ['$event.target']) onOutClick(targetElement) {
		const clickedInside = this.el.nativeElement.contains(targetElement);
		if (!clickedInside) {
			this.updateTip(false);
		}
	}

	constructor(private el: ElementRef) {
	}

	updateTip(open: boolean) {
		this.active = open;
		// poke the positioning to set the correct class for arrow
		if (this.tether) this.tether.position();
	}

	ngAfterViewInit() {
		this.tether = new Tether({
			element: this.tooltip.nativeElement,
			target: this.anchor.nativeElement,
			attachment: this.position.attachment,
			targetAttachment: this.position.targetAttachment,
			offset: this.offset,
			constraints: [
				{
					to: 'scrollParent',
					attachment: 'together'
				}
			],

		});
	}

	ngOnDestroy() {
		this.tether.destroy();
		this.tooltip.nativeElement.remove();
	}
}
