import { Component, Input } from '@angular/core';
import type { PageConfig } from './badge-detail.component.types';
import { CommonDialogsService } from '../../services/common-dialogs.service';
import { RecipientBadgeInstance } from '../../../recipient/models/recipient-badge.model';
import { BadgeInstance } from '../../../issuer/models/badgeinstance.model';

@Component({
    selector: 'bg-badgedetail',
    templateUrl: './badge-detail.component.html',
    styleUrls: ['./badge-detail.component.scss'],
    standalone: false
})
export class BgBadgeDetail {
	@Input() config: PageConfig;
	@Input() awaitPromises?: Promise<any>[];
	@Input() badge?: RecipientBadgeInstance | BadgeInstance;

	constructor(private dialogService: CommonDialogsService) {}

	shareBadge() {
		const baseUrl = window.location.origin;
		this.dialogService.shareSocialDialog.openDialog({
			title: 'Badge teilen',
			shareObjectType: 'BadgeInstance',
			shareUrl: `${baseUrl}/public/assertions/${this.config.badgeInstanceSlug}`,
			shareTitle: this.config.badgeTitle,
			imageUrl: this.config.issuerImage,
			shareIdUrl: `${baseUrl}/public/assertions/${this.config.badgeInstanceSlug}`,
			shareSummary: this.config.badgeDescription,
			shareEndpoint: 'certification',
			embedOptions: [],
			badge: this.badge
		});
	}
}
