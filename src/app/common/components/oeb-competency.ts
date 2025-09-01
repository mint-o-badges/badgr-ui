import { Component, Input } from '@angular/core';
import { lucideClock } from '@ng-icons/lucide';
import { Competency } from '../model/competency.model';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { HourPipe } from '../pipes/hourPipe';
import { HlmP } from '@spartan-ng/helm/typography';
import { HlmIcon } from '@spartan-ng/helm/icon';
@Component({
	selector: 'oeb-competency',
	providers: [provideIcons({ lucideClock })],
	host: {
		class: 'tw-rounded-[10px] tw-bg-oebgrey tw-border-purple tw-border-solid tw-border tw-relative tw-p-[calc(var(--gridspacing)*2)] tw-block tw-overflow-hidden',
	},
	template: `
		<div class="tw-flex tw-justify-between tw-items-center">
			<div>
				<span hlmP size="sm" class="tw-text-oebblack tw-font-medium">{{ competency.name }} </span>
				@if (competency['framework_identifier']) {
					<a
						hlmP
						class="tw-underline tw-text-link hover:!tw-text-buttonhover tw-cursor-pointer"
						size="sm"
						target="_blank"
						[href]="competency['framework_identifier']"
						text="inline link"
						>(E)</a
					>
				}
			</div>

			<div class="tw-text-purple tw-flex tw-items-center tw-whitespace-nowrap">
				@if (new) {
					<span hlmP size="sm" class="tw-bg-yellow tw-px-2 tw-mr-2 tw-rounded-[10px]">NEU</span>
				}
				<ng-icon hlm class="tw-mr-2" size="sm" name="lucideClock" />
				{{ competency.studyLoad | hourPipe }} h
			</div>
		</div>
	`,
	imports: [HlmP, NgIcon, HlmIcon, HourPipe],
})
export class OebCompetency {
	@Input() competency: Competency;
	@Input() new: boolean = false;
}
