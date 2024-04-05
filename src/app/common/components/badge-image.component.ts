import { Component, Input } from '@angular/core';

import { BadgeClassManager } from '../../issuer/services/badgeclass-manager.service';
import { MessageService } from '../services/message.service';
import { AbstractBadgeComponent } from './abstract-badge.component';
import { preloadImageURL } from '../util/file-util';

@Component({
	selector: 'badge-image',
	host: {
		class: 'badge',
		'[class.badge-is-noMargin]': 'noMargin',
		'[class.badge-is-locked]': 'locked',
		'[class.badge-is-disabled]': 'disabled',
	},
	template: `
		<a
			[routerLink]="['/issuer/issuers/', badge?.issuerSlug || '', 'badges', badge?.slug || '']"
			*ngIf="link && !loading && !failed"
		>
			<img [src]="badgeImageUrl" [title]="badge?.name" [width]="size" [height]="size" />
		</a>
		<a *ngIf="!(link && !loading && !failed)">
			<img [src]="loadingBadgeUrl" *ngIf="loading" title="Loading Badge..." [width]="size" [height]="size" />
			<img
				[src]="failedBadgeUrl"
				*ngIf="!loading && failed"
				title="Badge Failed to Load"
				[width]="size"
				[height]="size"
			/>
			<img
				[src]="badgeImageUrl"
				*ngIf="!loading && !failed"
				[title]="badge?.name"
				[width]="size"
				[height]="size"
			/>
		</a>
		<img
			[src]="awardedIconActive ? greenCheckCircleUrl : grayCheckCircleUrl"
			[width]="awardedIconSize"
			[height]="awardedIconSize"
			class="badge-x-awardedIcon"
			*ngIf="awardedIconSize > 0"
		/>
	`,

	// Inputs from superclass must be specified here again due to https://github.com/angular/angular/issues/5415
	inputs: ['badge', 'issuerId', 'badgeSlug', 'badgeId', 'forceFailed'],
})
export class BadgeImageComponent extends AbstractBadgeComponent {
	readonly greenCheckCircleUrl = preloadImageURL(
		'../../../breakdown/static/scss/images/awarded-green-check-circle.svg',
	);
	readonly grayCheckCircleUrl = preloadImageURL(
		'../../../breakdown/static/scss/images/awarded-gray-check-circle.svg',
	);
	readonly loadingBadgeUrl = preloadImageURL('../../../breakdown/static/images/badge-loading.svg');
	readonly failedBadgeUrl = preloadImageURL('../../../breakdown/static/images/badge-failed.svg');
	readonly emptyBadgeUrl = preloadImageURL('../../../breakdown/static/images/placeholderavatar.svg');

	@Input()
	link = true;

	@Input()
	noMargin = false;

	@Input()
	disabled = false;

	@Input()
	locked = false;

	@Input()
	awardedIconSize = 0;

	@Input()
	awardedIconActive = false;

	@Input()
	size = 40;

	badgeImageUrl: string;

	constructor(
		protected badgeManager: BadgeClassManager,
		protected messageService: MessageService,
	) {
		super(badgeManager, messageService);

		this.badgeLoaded$.subscribe((badge) => {
			const image = new Image();
			image.onerror = () => {
				console.error('Badge image failed to load', badge.image);
				this.badgeImageUrl = this.failedBadgeUrl;
			};
			image.onload = () => {
				this.badgeImageUrl = image.src;
			};
			image.src = badge ? badge.image : this.emptyBadgeUrl;
		});
	}
}
