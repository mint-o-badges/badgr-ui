import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
	selector: 'info-icon',
	template: `
		<div class="oeb-infoicon tw-relative tw-flex tw-items-center">
			<ng-icon hlm name="lucideInfo" size="24px" class="tw-text-purple"></ng-icon>
			<div
				class="oeb-infoicon__description tw-text-white tw-bg-purple tw-py-2 tw-px-3 tw-rounded-[10px] tw-ml-1"
				[style]="{ width: width() + 'px' }"
			>
				<ng-content />
			</div>
		</div>
	`,
	styles: [
		`
			.oeb-infoicon__description {
				position: absolute;
				z-index: 10;
				left: 100%;
				opacity: 0;
				visibility: hidden;
				transition:
					opacity 0.2s ease 0.2s,
					visibility 0.2s linear 0.2s;
			}
			.oeb-infoicon:hover .oeb-infoicon__description {
				opacity: 1;
				visibility: visible;
			}
		`,
	],
	standalone: true,
	imports: [NgIcon],
})
export class InfoIcon {
	width = input(200);
}
