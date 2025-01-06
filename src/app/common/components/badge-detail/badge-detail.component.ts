import { Component, Input } from '@angular/core';
import type { PageConfig } from './badge-detail.component.types';
import { CommonDialogsService } from '../../services/common-dialogs.service';
import { LearningPath } from '../../../issuer/models/learningpath.model';

@Component({
	selector: 'bg-badgedetail',
	templateUrl: './badge-detail.component.html',
	styleUrls: ['./badge-detail.component.scss'],
})
export class BgBadgeDetail {
	@Input() config: PageConfig;
	@Input() awaitPromises?: Promise<any>[];

	constructor(private dialogService: CommonDialogsService) {}

	calculateLearningPathStatus(lp: LearningPath): { match: string } | { progress: number } {
		if (lp.progress != null) {
			const percentCompleted = lp.progress;
			return { progress: percentCompleted };
		} 
		// else {
		// 	return { match: this.calculateMatch(lp) };
		// }
	}

	checkCompleted(lp: LearningPath): boolean {
		return lp.completed_at != null;
	}

	calculateStudyLoad(lp: LearningPath): number {
		const totalStudyLoad = lp.badges.reduce(
			(acc, b) => acc + b.badge.extensions['extensions:StudyLoadExtension'].StudyLoad,
			0,
		);
		return totalStudyLoad;
	}

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
