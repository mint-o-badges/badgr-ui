import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { HlmIconDirective } from '~/components/spartan/ui-icon-helm/src/lib/hlm-icon.directive';

@Component({
	selector: 'hlm-select-scroll-down',
	imports: [NgIcon, HlmIconDirective],
	providers: [provideIcons({ lucideChevronDown })],
	host: {
		class: 'tw-flex tw-cursor-default tw-items-center tw-justify-center tw-py-1',
	},
	template: ` <ng-icon hlm size="sm" class="tw-ml-2" name="lucideChevronDown" /> `,
})
export class HlmSelectScrollDownComponent {}
