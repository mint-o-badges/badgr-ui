import { Component, Input } from '@angular/core';
import type { PageConfig } from './badge-detail.component.types';
import { CommonDialogsService } from '../../services/common-dialogs.service';
import { LearningPath } from '../../../issuer/models/learningpath.model';
import { RecipientBadgeInstance } from '../../../recipient/models/recipient-badge.model';
import { BadgeInstance } from '../../../issuer/models/badgeinstance.model';
import { TranslateService } from '@ngx-translate/core';
import { PublicApiLearningPath } from '../../../public/models/public-api.model';
import { ApiImportedBadgeInstance } from '../../../recipient/models/recipient-badge-api.model';

@Component({
	selector: 'bg-badgedetail',
	templateUrl: './badge-detail.component.html',
	styleUrls: ['./badge-detail.component.scss'],
	standalone: false,
})
export class BgBadgeDetail {
	@Input() config: PageConfig;
	@Input() awaitPromises?: Promise<any>[];
	@Input() badge?: RecipientBadgeInstance | BadgeInstance | ApiImportedBadgeInstance;

	constructor(
		private dialogService: CommonDialogsService,
		private translate: TranslateService,
	) {
		this.translate.get('Badge.categories.competency').subscribe((str) => {
			this.competencyBadge = str;
		});
	}

	getLearningPaths(): PublicApiLearningPath[] {
		return this.config.learningPaths as PublicApiLearningPath[];
	}

	competencyBadge = this.translate.instant('Badge.categories.competency');

	calculateLearningPathStatus(lp: LearningPath | PublicApiLearningPath): { match: string } | { progress: number } {
		if (lp.progress != null) {
			const percentCompleted = lp.progress;
			return { progress: percentCompleted };
		}
		// else {
		// 	return { match: this.calculateMatch(lp) };
		// }
	}

	checkCompleted(lp: LearningPath | PublicApiLearningPath): boolean {
		return lp.completed_at != null;
	}

	calculateStudyLoad(lp: LearningPath | PublicApiLearningPath): number {
		const totalStudyLoad = lp.badges.reduce(
			(acc, b) => acc + b.badge.extensions['extensions:StudyLoadExtension'].StudyLoad,
			0,
		);
		return totalStudyLoad;
	}

	shareBadge() {
		const baseUrl = window.location.origin;
		this.dialogService.shareSocialDialog.openDialog({
			title: this.translate.instant('RecBadgeDetail.shareBadge'),
			shareObjectType: 'BadgeInstance',
			shareUrl: `${baseUrl}/public/assertions/${this.config.badgeInstanceSlug}`,
			shareTitle: this.config.badgeTitle,
			imageUrl: this.config.issuerImage,
			shareIdUrl: `${baseUrl}/public/assertions/${this.config.badgeInstanceSlug}`,
			shareSummary: this.config.badgeDescription,
			shareEndpoint: 'certification',
			embedOptions: [],
			badge: this.badge as any,
		});
	}
}
