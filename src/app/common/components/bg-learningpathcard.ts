import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'bg-learningpathcard',
	host: {
		class: 'tw-rounded-[10px] tw-w-[392px] tw-bg-white tw-border-purple tw-border-solid tw-border tw-relative tw-p-6 tw-block tw-overflow-hidden oeb-badge-card',
	},
	template: `
		<a
					class="tw-font-bold"
					[href]="publicUrl">
		<div class="tw-flex tw-flex-col">
				<div class="tw-bg-[var(--color-lightgray)] tw-w-full tw-relative tw-h-[175px] tw-items-center tw-flex tw-justify-center tw-p-2 tw-rounded-[3px]">
				<div class="tw-bg-[var(--color-purple)] tw-inline-flex tw-rounded-full tw-justify-center tw-items-center tw-p-2 tw-absolute tw-top-0 tw-right-0 tw-mt-1 tw-mr-1">
                    <hlm-icon class="tw-text-white" name="lucideRoute" />
                </div>
					<img
						class="tw-w-[80px] tw-h-[80px]"
						[loaded-src]="badgeImage"
						[loading-src]="badgeLoadingImageUrl"
						[error-src]="badgeFailedImageUrl"
						width="38"
					/>
				</div>
				<div class="tw-flex tw-flex-col tw-flex-wrap tw-py-2">
					<a
						class="tw-font-bold"
						[routerLink]="['/public/learningpaths/', slug]"
						hlmP
						size="sm"
						>{{ name }}</a>
						<a class="tw-text-[10px] tw-leading-3">{{issuerTitle}}</a>
						</div>
					
		</div>
		</a>
	`,
})
export class BgLearningPathCard {
	readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';
	@Input() slug: string;
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
	constructor() {
	}
}
