import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmInputModule } from '@spartan-ng/helm/input';
import { ApiLearningPath } from '~/common/model/learningpath-api.model';
import { BgLearningPathCard } from '~/common/components/bg-learningpathcard';
import { MatchingAlgorithm } from '~/common/util/matching-algorithm';

@Component({
	selector: 'recipient-learningpaths-overview',
	imports: [TranslatePipe, HlmInputModule, FormsModule, BgLearningPathCard],
	template: ` <!-- No badges, empty state! -->
		@if (learningPaths().length === 0) {
			<section class="emptysection l-emptysection">
				<h2 class="emptysection-x-headline">{{ 'RecBadge.noLearningPathYet' | translate }}</h2>
				<p class="emptysection-x-copy">{{ 'RecBadge.collectShareLearningPath' | translate }}</p>
				<div class="emptysection-x-imagecontainer">
					<img
						alt="Illustration of backpack with badges"
						class="emptysection-x-image"
						[src]="noBadgesImageUrl"
					/>
				</div>
			</section>
		} @else {
			<div class="oeb-section-sm">
				<div class="tw-flex tw-flex-wrap tw-items-center">
					<input
						type="text"
						name="forminput"
						id="forminput"
						placeholder="{{ 'LearningPath.searchMds' | translate }}"
						[(ngModel)]="searchQuery"
						class="tw-w-[300px] tw-border-solid tw-border-purple tw-bg-white tw-mr-6"
						hlmInput
					/>
				</div>
			</div>
		}

		<div>
			@if (learningPathsInProgress().length > 0) {
				<div class="oeb-section-sm">
					<h3 hlmH3 class="tw-uppercase tw-text-purple tw-font-bold tw-pb-4">
						{{ 'LearningPath.continue' | translate }}
					</h3>
					<div class="tw-grid min-[450px]:tw-grid-cols-learningpathsBackpack tw-gap-6">
						@for (lp of learningPathsInProgress(); track lp.slug) {
							<bg-learningpathcard
								[badgeImage]="$any(lp).participationBadge_image"
								[name]="lp.name"
								[issuerTitle]="lp.issuer_name"
								[description]="lp.description"
								[tags]="lp.tags"
								[slug]="lp.slug"
								[progress]="lp.progress"
								[completed]="checkCompleted(lp)"
								[requested]="lp.requested"
								[studyLoad]="calculateStudyLoad(lp)"
								[matchOrProgress]="{ progress: lp.progress / calculateStudyLoad(lp) }"
							></bg-learningpathcard>
						}
					</div>
				</div>
			}

			@if (learningPathsCompleted().length > 0) {
				<div class="oeb-section-sm">
					<h3 hlmH3 class="tw-uppercase tw-text-purple tw-font-bold tw-pb-4">
						{{ 'LearningPath.finished' | translate }}
					</h3>
					<div class="tw-grid min-[450px]:tw-grid-cols-learningpathsBackpack tw-gap-6">
						@for (lp of learningPathsCompleted(); track lp.slug) {
							<bg-learningpathcard
								[badgeImage]="$any(lp).participationBadge_image"
								[name]="lp.name"
								[issuerTitle]="lp.issuer_name"
								[description]="lp.description"
								[tags]="lp.tags"
								[slug]="lp.slug"
								[progress]="lp.progress"
								[completed]="true"
								[studyLoad]="calculateStudyLoad(lp)"
								[matchOrProgress]="{ progress: lp.progress / calculateStudyLoad(lp) }"
							></bg-learningpathcard>
						}
					</div>
				</div>
			}
		</div>`,
})
export default class RecipientLearningPathsOverview {
	readonly noBadgesImageUrl: string =
		'../../../../assets/@concentricsky/badgr-style/dist/images/image-empty-backpack.svg';
	learningPaths = input.required<ApiLearningPath[]>();
	filteredLearningPaths = computed(() =>
		this.learningPaths().filter(MatchingAlgorithm.learningPathMatcher(this.searchQuery())),
	);
	learningPathsInProgress = computed(() =>
		this.filteredLearningPaths().filter((lp) => !('completed_at' in lp) || lp.completed_at === null),
	);
	learningPathsCompleted = computed(() =>
		this.filteredLearningPaths().filter((lp) => 'completed_at' in lp && lp.completed_at !== null),
	);
	searchQuery = signal<string>('');

	calculateStudyLoad(lp: ApiLearningPath): number {
		const totalStudyLoad = lp.badges.reduce(
			(acc, b) => acc + b.badge.extensions['extensions:StudyLoadExtension'].StudyLoad,
			0,
		);
		return totalStudyLoad;
	}

	/**
	 * Checks wether the learning path is completed without actually
	 * recieving all badges, as the learning path doesn't require that.
	 */
	checkCompleted(lp: ApiLearningPath): boolean {
		if (!('completed_at' in lp) || lp.completed_at === null)
			return (lp.completed_badges?.length ?? 0) >= lp.required_badges_count;
		else return lp.completed_at !== null;
	}
}
