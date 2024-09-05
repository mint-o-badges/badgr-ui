import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'bg-learningpathcard',
	host: {
		class: 'tw-rounded-[10px] tw-max-w-[218px] tw-bg-white tw-border-purple tw-border-solid tw-border tw-relative tw-p-3 tw-block tw-overflow-hidden oeb-badge-card',
	},
	template: `
		<div class="tw-flex tw-items-center tw-h-full">
        	<div class="tw-p-2">
				<div class="tw-bg-[var(--color-lightgray)] tw-relative tw-h-[109px] tw-items-center tw-flex tw-justify-center tw-p-2 tw-rounded-[3px]">
				<div class="tw-bg-[var(--color-purple)] tw-inline-flex tw-rounded-full tw-justify-center tw-items-center tw-p-2 tw-absolute tw-top-0 tw-right-0 tw-mt-1 tw-mr-1">
                    <hlm-icon class="tw-text-white !tw-mr-0" size="xxs" name="lucideRoute" />
                </div>
					<img
						class="tw-w-[38px] tw-h-[38px]"
						[loaded-src]="badgeImage"
						[loading-src]="badgeLoadingImageUrl"
						[error-src]="badgeFailedImageUrl"
						width="38"
					/>
				</div>
				<div class="tw-flex tw-flex-col tw-flex-wrap tw-py-2">
					<a
						class="tw-font-bold"
						[routerLink]="[]"
						hlmP
						size="sm"
						>{{ name }}</a>
						<a class="tw-text-[10px] tw-leading-3">{{issuerTitle}}</a>
						</div>
					
			</div>
		</div>
	`,
})
export class BgLearningPathCard {
	readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';
	@Input() badgeSlug: string;
	@Input() issuerSlug: string;
	@Input() publicUrl: string;
	@Input() badgeImage: string;
	@Input() name: string;
	@Input() description: string;
	@Input() badgeIssueDate: string;
	@Input() badgeClass: string;
	@Input() issuerTitle: string;
	@Input() tags: string[];
	@Input() public = false;
	@Output() shareClicked = new EventEmitter<MouseEvent>();
}
