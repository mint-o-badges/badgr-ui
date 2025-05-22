import { AfterViewInit, Component, Directive, ElementRef, Input, NgZone, OnInit, Renderer2 } from '@angular/core';
import { OnDestroy } from '@angular/core';
import Popper, { Placement } from 'popper.js';

/**
 * Directive that implements popper.js-based popup menus
 */
@Component({
	selector: 'info-icon',
	template: `
		<div class="oeb-infoicon tw-relative tw-flex tw-items-center" [class]="{'oeb-infoicon--init': init}">
			<ng-icon hlm name="lucideInfo" class="tw-w-4 tw-h-4 tw-text-purple"></ng-icon>
			<div class="oeb-infoicon__description tw-text-white tw-bg-purple tw-py-2 tw-px-3 tw-rounded-[10px] tw-ml-1 tw-w-[{{width}}px]">
				<ng-content/>
			</div>
		</div>
	`,
	styles: [`
		.oeb-infoicon__description {
			position: absolute;
			z-index: 10;
			left: 100%;
			opacity: 0;
			visibility: hidden;
		}
		.oeb-infoicon--init .oeb-infoicon__description {
			transition: opacity 0.2s ease 0.2s, visibility 0.2s linear 0.2s;
		}
		.oeb-infoicon:hover .oeb-infoicon__description {
			opacity: 1;
			visibility: visible;
		}
	`],
	standalone: false,
})
export class InfoIcon implements OnInit {
	@Input() width = 200;

	init = false;

	ngOnInit(): void {
		// prevent css transition flashing
		setTimeout(() => {
			this.init = true;
		}, 1)
	}
}
