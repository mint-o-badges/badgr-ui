import { CommonModule } from '@angular/common';
import { BadgrCommonModule } from '../common/badgr-common.module';
import { TranslateModule } from '@ngx-translate/core';
import { BrnAccordionContentComponent } from '@spartan-ng/ui-accordion-brain';
import { HlmAccordionModule } from './spartan/ui-accordion-helm/src';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'competency-accordion',
	standalone: true,
	imports: [
		HlmAccordionModule,
		HlmIconModule,
		TranslateModule,
		BrnAccordionContentComponent,
		RouterModule,
	],
	template: `<div hlmAccordion>
		<div hlmAccordionItem>
			<button
				class="tw-w-40 tw-px-2 tw-py-2 tw-bg-white tw-rounded-xl tw-border tw-border-solid tw-border-[var(--color-purple)]"
				hlmAccordionTrigger
			>
				{{ 'General.showDetails' | translate }}
				<hlm-icon hlmAccIcon />
			</button>
			<brn-accordion-content hlm>
				<div class="tw-flex tw-gap-4 tw-mt-2">
					<span class="tw-font-semibold">{{ 'General.category' | translate }}: </span>
					<span class="tw-capitalize">{{ category }}</span>
				</div>
				<span class="tw-mt-4 tw-italic">{{ description }}</span>
			</brn-accordion-content>
		</div>
	</div> `,
})
export class CompetencyAccordionComponent {
	@Input() category: string;
	@Input() description: string;
}
