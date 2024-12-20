import { Component, Input } from '@angular/core';
import type { PageConfig } from './badge-detail.component.types';
import { CommonDialogsService } from '../../services/common-dialogs.service';

@Component({
	selector: 'bg-badgedetail',
	templateUrl: './badge-detail.component.html',
	styleUrls: ['./badge-detail.component.scss'],
})
export class BgBadgeDetail {
	@Input() config: PageConfig;
	@Input() awaitPromises?: Promise<any>[];

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
		});
	}
}
