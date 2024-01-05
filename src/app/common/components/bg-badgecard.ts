import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
	selector: 'bg-badgecard',
	host: {'class': 'badgecard'},
	template: `
		<div class="badgecard-x-status badgestatus badgestatus-{{mostRelevantStatus}}" *ngIf="mostRelevantStatus">
			{{mostRelevantStatus}}
		</div>

		<div class="badgecard-x-body">
			<div class="badgecard-x-image">
				<img class="badgeimage badgeimage-{{mostRelevantStatus}}"
					[loaded-src]="badgeImage"
					[loading-src]="badgeLoadingImageUrl"
					[error-src]="badgeFailedImageUrl"
					width="80" />
			</div>
			<a *ngIf="badgeSlug" class="badgecard-x-title u-text-breakword" [routerLink]="['../earned-badge', badgeSlug]">{{ badgeTitle }}</a>
			<a *ngIf="publicUrl" class="badgecard-x-title" [href]="publicUrl">{{ badgeTitle }}</a>
			<a *ngIf="issuerSlug; else noIssuerSlug" class="badgecard-x-issuer" [routerLink]="['../../public/issuers', issuerSlug]">{{ issuerTitle }}</a>
			<ng-template #noIssuerSlug>
				<div class="badgecard-x-issuer">{{ issuerTitle }}</div>
			</ng-template>
			<p class="badgecard-x-desc" [truncatedText]="badgeDescription" [maxLength]="100"></p>
		</div>
		<div class="badgecard-x-footer">
			<div class="badgecard-x-date">
				<span *ngIf="badgeClass" i18n>
					Available since:
				</span>
				<time [date]="badgeIssueDate" format="mediumDate"></time>
			</div>
			<!-- Show Verify or Share Button unless public -->
			<button class="badgecard-x-sharelink" *ngIf="!verifyUrl && !public && (mostRelevantStatus !== 'pending')"
					(click)="shareClicked.emit($event)">
				Share
			</button>
			<a class="badgecard-x-sharelink" *ngIf="verifyUrl" [href]="verifyUrl">
				Verify
			</a>
		</div>
	`
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
	@Input() mostRelevantStatus: "expired" | "new" | "pending" | undefined;
	@Input() verifyUrl: string;
	@Input() public = false;
	@Output() shareClicked = new EventEmitter<MouseEvent>();
}
