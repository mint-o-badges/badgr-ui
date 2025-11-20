import { Component, computed, input } from '@angular/core';
import { RecipientBadgeInstance } from '~/recipient/models/recipient-badge.model';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmH3, HlmP } from '@spartan-ng/helm/typography';
import { TranslatePipe } from '@ngx-translate/core';
import { CountUpModule } from 'ngx-countup';
import { OebCompetency } from '~/common/components/oeb-competency';
import { Competency } from '~/common/model/competency.model';
import { KeyValuePipe } from '@angular/common';

@Component({
	selector: 'recipient-competency-overview',
	template: `
		<div class="oeb-headline-container-sm">
			<div class="oeb-section-sm">
				<div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
					<div
						class="tw-bg-white tw-rounded-[10px] tw-border-purple tw-border-solid tw-border tw-h-[90px] tw-p-4"
					>
						<div class="tw-whitespace-nowrap tw-flex tw-items-center tw-mb-2">
							<ng-icon hlm class="tw-mr-2" size="sm" name="lucideHexagon" /><span hlmP size="sm">{{
								'RecBadge.competencies' | translate
							}}</span>
						</div>
						<p hlmP #countup class="tw-text-purple tw-font-bold" [countUp]="totalSkills()"></p>
					</div>
					<div
						class="tw-bg-white tw-rounded-[10px] tw-border-purple tw-border-solid tw-border tw-h-[90px] tw-p-4"
					>
						<div class="tw-whitespace-nowrap tw-flex tw-items-center tw-mb-2">
							<ng-icon hlm class="tw-mr-2" size="sm" name="lucideClock" /><span hlmP size="sm">{{
								'RecBadge.studyingTime' | translate
							}}</span>
						</div>
						<p hlmP class="tw-text-purple tw-font-bold">
							<span #countup2 [countUp]="totalStudyTime()"></span>
							{{ 'RecBadge.hours' | translate }}
						</p>
					</div>
				</div>
			</div>
			<div class="oeb-section-sm">
				@if (highlightedCompetencies().size > 0) {
					<div class="lg:tw-flex tw-flex-wrap oeb-standard-padding-bottom">
						<div class="tw-w-full lg:tw-w-[270px] lg:tw-flex-shrink-0 lg:tw-pb-0 tw-pb-4">
							<div class="tw-flex tw-items-center">
								<ng-icon hlm class="tw-mr-2" name="lucideHeart" />
								<h3 hlmH3 class="tw-font-medium tw-text-oebblack tw-ml-2">
									{{ 'RecBadge.newCompetencies' | translate }}
								</h3>
							</div>
						</div>
						<div class="tw-flex-grow">
							<div class="tw-grid tw-grid-cols-1 tw-gap-2">
								@for (entry of highlightedCompetencies(); track entry[0]) {
									<oeb-competency [competency]="entry[1]" [new]="true" />
								}
							</div>
						</div>
					</div>
				}
				<div class="lg:tw-flex tw-flex-wrap oeb-standard-padding-bottom">
					<div class="tw-w-full lg:tw-w-[270px] lg:tw-flex-shrink-0 lg:tw-pb-0 tw-pb-4">
						<div class="tw-flex tw-items-center">
							<ng-icon hlm class="tw-mr-2" name="lucideHand" />
							<h3 hlmH3 class="tw-font-medium tw-text-oebblack tw-ml-2">
								{{ 'RecBadge.skills' | translate }}
							</h3>
						</div>
					</div>
					<div class="tw-flex-grow">
						<div class="tw-grid tw-grid-cols-1 tw-gap-2">
							@for (entry of aggregatedCompetencies(); track entry[0]) {
								@if (entry[1].category === 'skill') {
									<oeb-competency [competency]="entry[1]" />
								}
							}
						</div>
					</div>
				</div>
				<div class="lg:tw-flex tw-flex-wrap oeb-standard-padding-bottom">
					<div class="tw-w-full lg:tw-w-[270px] lg:tw-flex-shrink-0 lg:tw-pb-0 tw-pb-4">
						<div class="tw-flex tw-items-center">
							<ng-icon hlm class="tw-mr-2" name="lucideBookOpen" />
							<h3 hlmH3 class="tw-font-medium tw-text-oebblack tw-ml-2">
								{{ 'RecBadge.knowledge' | translate }}
							</h3>
						</div>
					</div>
					<div class="tw-flex-grow">
						<div class="tw-grid tw-grid-cols-1 tw-gap-2">
							@for (entry of aggregatedCompetencies(); track entry[0]) {
								@if (entry[1].category === 'knowledge') {
									<oeb-competency [competency]="entry[1]" />
								}
							}
						</div>
					</div>
				</div>
			</div>
		</div>
	`,
	imports: [NgIcon, HlmIcon, HlmP, HlmH3, TranslatePipe, CountUpModule, OebCompetency],
})
export class RecipientCompetencyOverview {
	badges = input.required<RecipientBadgeInstance[]>();
	aggregatedCompetencies = computed(() => this.aggregateCompetencies(this.badges()));
	highlightedCompetencies = computed(() =>
		this.aggregateCompetencies(this.badges().filter((b) => b.mostRelevantStatus)),
	);
	totalSkills = computed(() => this.aggregatedCompetencies().size);
	totalStudyTime = computed(
		() => Array.from(this.aggregatedCompetencies()).reduce((agg, [key, obj]) => agg + obj.studyLoad, 0) / 60,
	);

	private aggregateCompetencies(badges: RecipientBadgeInstance[]): Map<string, Competency> {
		const competencies = badges
			// by sorting for issue date here, we can be sure that the first occurence of a competency
			// in the list is also the newest one hence the last time it was received
			.sort((b1, b2) => b2.issueDate.getTime() - b1.issueDate.getTime())
			.flatMap((b) => {
				const competencies = b
					.getExtension('extensions:CompetencyExtension', [{}])
					.map((c) => ({ ...c, lastReceived: b.issueDate })) as Competency[];
				return competencies;
			});

		const map = new Map<string, Competency>();
		for (const c of competencies) {
			// use name + studyload for manual competencies because there is no framework identifier (like ESCO) for them
			const key = c['framework_identifier'] || `${c.name}${c.studyLoad}`;
			if (map.has(key)) {
				map[key].studyLoad += c.studyLoad;
			} else {
				map.set(key, c);
			}
		}
		return map;
	}
}
