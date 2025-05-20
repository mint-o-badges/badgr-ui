import { Component, Input } from '@angular/core';
import type { PageConfig } from './badge-detail.component.types';
import { CommonDialogsService } from '../../services/common-dialogs.service';
import { LearningPath } from '../../../issuer/models/learningpath.model';
import { RecipientBadgeInstance } from '../../../recipient/models/recipient-badge.model';
import { BadgeInstance } from '../../../issuer/models/badgeinstance.model';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { BgAwaitPromises } from '../../directives/bg-await-promises';
import { NgIf, NgFor, LowerCasePipe } from '@angular/common';
import { FormMessageComponent } from '../form-message.component';
import { BgBreadcrumbsComponent } from '../bg-breadcrumbs/bg-breadcrumbs.component';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { RouterLink } from '@angular/router';
import { OebDropdownComponent } from '../../../components/oeb-dropdown.component';
import { SvgIconComponent } from '../svg-icon.component';
import { BgImageStatusPlaceholderDirective } from '../../directives/bg-image-status-placeholder.directive';
import { OebCollapsibleComponent } from '../../../components/oeb-collapsible.component';
import { NgIcon } from '@ng-icons/core';
import { HlmIconDirective } from '../../../components/spartan/ui-icon-helm/src/lib/hlm-icon.directive';
import { TimeComponent } from '../time.component';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { CompetencyAccordionComponent } from '../../../components/accordion.component';
import { OebSeparatorComponent } from '../../../components/oeb-separator.component';
import { BgLearningPathCard } from '../bg-learningpathcard';
import { HourPipe } from '../../pipes/hourPipe';

@Component({
    selector: 'bg-badgedetail',
    templateUrl: './badge-detail.component.html',
    styleUrls: ['./badge-detail.component.scss'],
    imports: [
        BgAwaitPromises,
        NgIf,
        FormMessageComponent,
        BgBreadcrumbsComponent,
        HlmH1Directive,
        OebButtonComponent,
        RouterLink,
        OebDropdownComponent,
        SvgIconComponent,
        BgImageStatusPlaceholderDirective,
        OebCollapsibleComponent,
        NgIcon,
        HlmIconDirective,
        NgFor,
        TimeComponent,
        HlmPDirective,
        CompetencyAccordionComponent,
        OebSeparatorComponent,
        BgLearningPathCard,
        LowerCasePipe,
        TranslatePipe,
        HourPipe,
    ],
})
export class BgBadgeDetail {
	@Input() config: PageConfig;
	@Input() awaitPromises?: Promise<any>[];
	@Input() badge?: RecipientBadgeInstance | BadgeInstance;

	constructor(
		private dialogService: CommonDialogsService,
		private translate: TranslateService
	) {}

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
			title: this.translate.instant('RecBadgeDetail.shareBadge'),
			shareObjectType: 'BadgeInstance',
			shareUrl: `${baseUrl}/public/assertions/${this.config.badgeInstanceSlug}`,
			shareTitle: this.config.badgeTitle,
			imageUrl: this.config.issuerImage,
			shareIdUrl: `${baseUrl}/public/assertions/${this.config.badgeInstanceSlug}`,
			shareSummary: this.config.badgeDescription,
			shareEndpoint: 'certification',
			embedOptions: [],
			badge: this.badge,
		});
	}
}
