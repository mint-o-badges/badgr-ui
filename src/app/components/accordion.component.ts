import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BrnAccordionContentComponent } from '@spartan-ng/ui-accordion-brain';
import { HlmAccordionModule } from './spartan/ui-accordion-helm/src';
import { HlmIconModule, provideIcons } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, Input } from '@angular/core';
import { lucideClock } from '@ng-icons/lucide';

@Component({
	selector: 'competency-accordion',
	standalone: true,
	providers: [provideIcons({ lucideClock })],
	imports: [
		HlmAccordionModule,
		HlmIconModule,
		TranslateModule,
		BrnAccordionContentComponent,
		RouterModule,
		NgIf,
	],
	template: `
	<div class="tw-bg-[var(--color-lightgray)] tw-border tw-border-solid tw-border-purple tw-rounded-lg tw-mt-4"><div hlmAccordion>
		<div hlmAccordionItem class="tw-px-2 tw-py-2">
			<button
				class="tw-w-full hover:tw-no-underline"
				hlmAccordionTrigger
			>
				<div class="tw-w-full tw-flex tw-justify-between">
					<div class="tw-flex tw-gap-2 tw-flex-shrink-1">
						<span class="tw-font-bold tw-text-left">{{ name }} <a href="http://data.europa.eu/{{escoID}}" class="tw-text-link tw-font-normal tw-underline" *ngIf="escoID">[E]</a></span>
					</div>
					<div class="tw-text-purple tw-whitespace-nowrap tw-flex tw-items-center tw-gap-2 tw-mr-2">
						<hlm-icon name="lucideClock" class="!tw-w-4 !tw-h-4" />
					 	<span>{{ studyload.toString() }} </span>
					</div>
				</div>
				<hlm-icon hlmAccIcon class="tw-w-8 tw-h-8" />
			</button>
			<brn-accordion-content hlm>
			<hr class="tw-w-full tw-my-2 tw-border tw-text-[#cfcece] tw-bg-[#cfcece] tw-border-solid" />
			<span class="tw-mt-4 tw-text-oebblack tw-font-semibold">{{ description }}</span>
			<div class="tw-flex tw-gap-4 tw-mt-2">
				<span>{{ 'General.category' | translate }}: </span>
				<span class="tw-capitalize">{{ category }}</span>
			</div>
			</brn-accordion-content>
		</div>
	</div>
	</div> `,
})
export class CompetencyAccordionComponent {
	@Input() category: string;
	@Input() description: string;
	@Input() name: string;
	@Input() studyload: number;
	@Input() escoID?: string;
}
