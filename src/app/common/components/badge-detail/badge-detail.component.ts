import { Component, Input } from '@angular/core';
import type { PageConfig } from './badge-detail.component.types';
import { LearningPath } from '../../../issuer/models/learningpath.model';
import { RecipientBadgeInstance } from '../../../recipient/models/recipient-badge.model';
import { BadgeInstance } from '../../../issuer/models/badgeinstance.model';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { BgAwaitPromises } from '../../directives/bg-await-promises';
import { FormMessageComponent } from '../form-message.component';
import { BgBreadcrumbsComponent } from '../bg-breadcrumbs/bg-breadcrumbs.component';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { RouterLink } from '@angular/router';
import { OebDropdownComponent } from '../../../components/oeb-dropdown.component';
import { SvgIconComponent } from '../svg-icon.component';
import { BgImageStatusPlaceholderDirective } from '../../directives/bg-image-status-placeholder.directive';
import { OebCollapsibleComponent } from '../../../components/oeb-collapsible.component';
import { NgIcon } from '@ng-icons/core';
import { InfoIcon } from '../info-icon.component';
import { TimeComponent } from '../time.component';
import { CompetencyAccordionComponent } from '../../../components/accordion.component';
import { OebSeparatorComponent } from '../../../components/oeb-separator.component';
import { BgLearningPathCard } from '../bg-learningpathcard';
import { HourPipe } from '../../pipes/hourPipe';
import { PublicApiLearningPath } from '../../../public/models/public-api.model';
import { ApiImportedBadgeInstance } from '../../../recipient/models/recipient-badge-api.model';
import { RecipientBadgeManager } from '../../../recipient/services/recipient-badge-manager.service';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmH1, HlmP } from '@spartan-ng/helm/typography';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import {
	ShareBadgeDialogComponent,
	ShareBadgeDialogContext,
} from '~/common/dialogs/oeb-dialogs/share-badge-dialog.component';
import { NgClass } from '@angular/common';

@Component({
	selector: 'bg-badgedetail',
	templateUrl: './badge-detail.component.html',
	styleUrls: ['./badge-detail.component.scss'],
	imports: [
		BgAwaitPromises,
		FormMessageComponent,
		BgBreadcrumbsComponent,
		HlmH1,
		OebButtonComponent,
		RouterLink,
		OebDropdownComponent,
		SvgIconComponent,
		BgImageStatusPlaceholderDirective,
		OebCollapsibleComponent,
		NgIcon,
		HlmIcon,
		InfoIcon,
		TimeComponent,
		HlmP,
		CompetencyAccordionComponent,
		OebSeparatorComponent,
		BgLearningPathCard,
		TranslatePipe,
		HourPipe,
		NgClass,
	],
})
export class BgBadgeDetail {
	@Input() config: PageConfig;
	@Input() awaitPromises?: Promise<any>[];
	@Input() badge?: RecipientBadgeInstance | BadgeInstance | ApiImportedBadgeInstance;

	constructor(
		private dialogService: HlmDialogService,
		private translate: TranslateService,
		private recipientManager: RecipientBadgeManager,
	) {
		this.translate.get('Badge.categories.competency').subscribe((str) => {
			this.competencyBadge = str;
		});
	}

	getLearningPaths(): PublicApiLearningPath[] {
		return this.config.learningPaths as PublicApiLearningPath[];
	}

	get hasCriteria(): boolean {
		return (
			this.config?.awardCriteria &&
			Array.isArray(this.config.awardCriteria) &&
			this.config.awardCriteria.length > 0
		);
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
		if (lp.required_badges_count != lp.badges.length) {
			const userAssertions = this.recipientManager.recipientBadgeList.entities;
			const badgeClassIds = lp.badges.map((b) => b.badge.slug);
			const userBadgeCount = userAssertions.filter((b) =>
				badgeClassIds.some((i) => b.badgeClass.slug == i),
			).length;
			return userBadgeCount >= lp.required_badges_count;
		}
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
		if (this.badge && this.badge instanceof RecipientBadgeInstance)
			this.dialogService.open(ShareBadgeDialogComponent, {
				context: { badge: this.badge } satisfies ShareBadgeDialogContext,
			});
	}
}
