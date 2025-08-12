import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { HlmIcon } from '../../../ui-icon-helm/src';

@Component({
	selector: 'hlm-select-scroll-down',
	imports: [NgIcon, HlmIcon],
	providers: [provideIcons({ lucideChevronDown })],
	host: {
		class: 'tw-flex tw-cursor-default tw-items-center tw-justify-center tw-py-1',
	},
	template: ` <ng-icon hlm size="sm" class="tw-ml-2" name="lucideChevronDown" /> `,
})
export class HlmSelectScrollDown {}
