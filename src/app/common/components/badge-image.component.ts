import { Component, Input } from '@angular/core';

import { BadgeClassManager } from '../../issuer/services/badgeclass-manager.service';
import { MessageService } from '../services/message.service';
import { AbstractBadgeComponent } from './abstract-badge.component';
import { preloadImageURL } from '../util/file-util';

import { RouterLink } from '@angular/router';

@Component({
	selector: 'badge-image',
	host: {
		class: 'badge',
		'[class.badge-is-noMargin]': 'noMargin',
		'[class.badge-is-locked]': 'locked',
		'[class.badge-is-disabled]': 'disabled',
	},
	template: `
		@if (link && !loading && !failed) {
		  <a
		    [routerLink]="['/issuer/issuers/', badge?.issuerSlug || '', 'badges', badge?.slug || '']"
		    >
		    <img [src]="badgeImageUrl" [title]="badge?.name" [width]="size" [height]="size" />
		  </a>
		}
		@if (!(link && !loading && !failed)) {
		  <a>
		    @if (loading) {
		      <img [src]="loadingBadgeUrl" title="Loading Badge..." [width]="size" [height]="size" />
		    }
		    @if (!loading && failed) {
		      <img
		        [src]="failedBadgeUrl"
		        title="Badge Failed to Load"
		        [width]="size"
		        [height]="size"
		        />
		    }
		    @if (!loading && !failed) {
		      <img
		        [src]="badgeImageUrl"
		        [title]="badge?.name"
		        [width]="size"
		        [height]="size"
		        />
		    }
		  </a>
		}
		@if (awardedIconSize > 0) {
		  <img
		    [src]="awardedIconActive ? greenCheckCircleUrl : grayCheckCircleUrl"
		    [width]="awardedIconSize"
		    [height]="awardedIconSize"
		    class="badge-x-awardedIcon"
		    />
		}
		`,
	// Inputs from superclass must be specified here again due to https://github.com/angular/angular/issues/5415
	inputs: ['badge', 'issuerId', 'badgeSlug', 'badgeId', 'forceFailed'],
	imports: [RouterLink],
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
