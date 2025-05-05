import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'bg-collectioncard',
	host: {
		class: 'tw-rounded-[10px] tw-bg-white tw-h-max tw-max-w-[450px] tw-border-purple tw-border-solid tw-border tw-relative tw-p-4 tw-block tw-overflow-hidden oeb-badge-card',
	},
	template: `
	
		<a [routerLink]="['../badge-collections/collection/', slug]" class="tw-h-[100px]" >
			<div class="tw-flex tw-flex-col tw-items-center tw-h-full">
                <h2 class="tw-text-oebblack tw-font-semibold tw-text-[22px] tw-leading-[120%]">
                    {{name}}
                </h2>
                <footer class="tw-flex tw-justify-between tw-items-center tw-w-full">
                    <oeb-switch 
                    [text]="'General.public' | translate ">

                    </oeb-switch>
                    <oeb-button 
						[text]="'BadgeCollection.share' | translate"
						size="sm"
					>
                    </oeb-button>
                </footer>
			</div>
		</a>
	`,
	standalone: false,
})
export class BgCollectionCard {
	readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';
    @Input() name: string 
    @Input() public = false
	@Input() slug: string



	// @HostBinding('class') get hostClasses(): string {
	// 	return this.checked || this.completed ? 'tw-bg-[var(--color-lightgreen)]' : 'tw-bg-white';
	// }

	ngOnInit() {}

	
}
