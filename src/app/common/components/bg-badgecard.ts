import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'bg-badgecard',
	host: {
		class: 'tw-rounded-[10px] tw-bg-white tw-border-purple tw-border-solid tw-border tw-relative tw-p-3 tw-block tw-overflow-hidden oeb-badge-card',
	},
	template: `
		<div
			class="tw-absolute tw-top-0 tw-left-0 tw-bg-purple tw-text-white tw-px-2 tw-py-1"
			*ngIf="mostRelevantStatus"
		>
			{{ mostRelevantStatus }}
		</div>

		<div class="tw-flex tw-items-center tw-h-full">
			<img
				class="badgeimage badgeimage-{{ mostRelevantStatus }}"
				[loaded-src]="badgeImage"
				[loading-src]="badgeLoadingImageUrl"
				[error-src]="badgeFailedImageUrl"
				width="80"
			/>
			<div class="tw-flex tw-flex-col tw-flex-wrap tw-pl-4 tw-py-2">
				<a
					*ngIf="badgeSlug && !publicUrl"
					class="tw-font-bold"
					[routerLink]="['../earned-badge', badgeSlug]"
					hlmP
					size="sm"
					>{{ badgeTitle }}</a>
				<a *ngIf="publicUrl"
					class="tw-font-bold"
					hlmP
					size="sm" [href]="publicUrl">{{ badgeTitle }}</a>

				<div class="tw-pt-2 tw-flex tw-flex-col tw-flex-wrap">
					<a
						hlmP
						size="sm"
						variant="light"
						*ngIf="issuerSlug; else noIssuerSlug"
						class="badgecard-x-issuer"
						[routerLink]="['../../public/issuers', issuerSlug]"
						>{{ issuerTitle }}</a>
					<ng-template #noIssuerSlug>
						<div class="badgecard-x-issuer">{{ issuerTitle }}</div>
					</ng-template>
					<time [date]="badgeIssueDate" format="dd.MM.y"></time>
				</div>

				<div class="tw-absolute tw-left-0 tw-bottom-2 tw-w-full">
					<!-- Show Verify or Share Button unless public -->
					<div class="tw-float-right tw-pr-4">
					<!-- <a
							hlmA
							hlmP
							size="sm"
							class="tw-font-bold tw-text-purple tw-no-underline"
							*ngIf="!verifyUrl && !public && mostRelevantStatus !== 'pending'"
							(click)="shareClicked.emit($event)"
						>
							{{ 'BadgeCollection.share' | translate }}
						</a> -->
						<a
							hlmA
							hlmP
							size="sm"
							class="tw-font-bold tw-text-purple tw-no-underline"
							*ngIf="verifyUrl"
							[href]="verifyUrl"
						>
							{{ 'RecBadgeDetail.verify' | translate }}
						</a>
					</div>
				</div>
			</div>
		</div>
	`,
})
export class BgBadgecard {
	readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';
	@Input() badgeSlug: string;
	@Input() issuerSlug: string;
	@Input() publicUrl: string;
	@Input() badgeImage: string;
	@Input() badgeTitle: string;
	@Input() badgeDescription: string;
	@Input() badgeIssueDate: string;
	@Input() badgeClass: string;
	@Input() issuerTitle: string;
	@Input() mostRelevantStatus: 'expired' | 'new' | 'pending' | undefined;
	@Input() verifyUrl: string;
	@Input() public = false;
	@Output() shareClicked = new EventEmitter<MouseEvent>();
}
