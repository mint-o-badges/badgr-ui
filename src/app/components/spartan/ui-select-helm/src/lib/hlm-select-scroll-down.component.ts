import { NgIcon } from '@ng-icons/core';
import { Component } from '@angular/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { HlmIconDirective } from '../../../ui-icon-helm/src';
import { provideIcons } from '@ng-icons/core';

@Component({
	selector: 'hlm-select-scroll-down',
	imports: [NgIcon, HlmIconDirective],
	providers: [provideIcons({ lucideChevronDown })],
	host: {
		class: 'tw-flex tw-cursor-default tw-items-center tw-justify-center tw-py-1',
	},
	template: ` <ng-icon hlm class="tw-w-4 tw-h-4 tw-ml-2" name="lucideChevronDown" /> `,
})
export class HlmSelectScrollDownComponent {}
