import { Component, Input } from '@angular/core';
import { RecipientBadgeCollection } from '../recipient/models/recipient-badge-collection.model';

@Component({
	selector: 'bg-collectioncard',
	host: {
		class: 'tw-rounded-[10px] tw-bg-white tw-h-max tw-max-w-[450px] tw-border-purple tw-border-solid tw-border tw-relative tw-p-4 tw-block tw-overflow-hidden oeb-badge-card',
	},
	template: `
		<div class="tw-h-[200px]">
			<div class="tw-flex tw-flex-col tw-items-center tw-h-full tw-w-full">
				<a class="tw-w-full" [routerLink]="['../badge-collections/collection/', collection.slug]">
					<h2
						class="tw-w-full tw-text-oebblack tw-font-semibold tw-text-[22px] tw-leading-[120%] tw-text-left"
					>
						{{ collection.name }}
					</h2>
				</a>
				<div class="tw-my-5" *ngIf="!collection.badges.length">
					<span class="tw-text-oebblack tw-text-lg"> Diese Sammlung enthält noch keine Badges </span>
				</div>
				<div
					*ngIf="collection.badges.length"
					class="tw-flex tw-overflow-x-auto tw-overflow-y-hidden tw-w-full md:tw--space-x-6 tw--space-x-4 tw-pt-4 pt-pb-4"
				>
					<div
						class="tw-flex-shrink-0 hover:tw-scale-105 hover:tw-z-10 tw-transform tw-ease-in-out tw-transition tw-duration-200"
						*ngFor="let badge of collection.badges"
					>
						<img
							[src]="badge.image"
							[title]="badge?.name"
							class="md:tw-w-[80px] md:tw-h-[80px] tw-w-[50px] tw-h-[50px]"
						/>
					</div>
				</div>
				<footer class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mt-4">
					<div class="tw-items-center tw-w-full">
						<!-- <label hlmLabel class="tw-flex tw-gap-4">
							<hlm-switch 
								[(ngModel)]="collection.published" 
								(ngModelChange)="togglePublished()"
							>
							</hlm-switch>
							<span class="tw-text-oebblack tw-text-lg">{{'General.public' | translate }}</span> 
						</label> -->
					</div>
					<oeb-button [text]="'BadgeCollection.share' | translate" size="sm" disabled="true"> </oeb-button>
				</footer>
			</div>
		</div>
	`,
	standalone: false,
})
export class BgCollectionCard {
	readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';
	@Input() collection: RecipientBadgeCollection = null;

	togglePublished() {
		this.collection.save();
	}

	ngOnInit() {}
}
