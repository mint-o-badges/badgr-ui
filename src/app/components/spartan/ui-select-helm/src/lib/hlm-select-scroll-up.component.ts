import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronUp } from '@ng-icons/lucide';
import { HlmIconDirective } from '~/components/spartan/ui-icon-helm/src/lib/hlm-icon.directive';

@Component({
	selector: 'hlm-select-scroll-up',
	imports: [NgIcon, HlmIconDirective],
	providers: [provideIcons({ lucideChevronUp })],
	host: {
		class: 'tw-flex tw-cursor-default tw-items-center tw-justify-center tw-py-1',
	},
	template: ` <ng-icon hlm size="sm" class="tw-ml-2" name="lucideChevronUp" /> `,
})
export class HlmSelectScrollUpComponent {}
